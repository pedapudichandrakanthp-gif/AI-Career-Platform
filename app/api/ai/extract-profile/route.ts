import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  try {
    const { jobId, examDate, userId } = await request.json();

    if (!jobId || !examDate || !userId) {
      return NextResponse.json({ error: "Missing required fields: jobId, examDate, userId" }, { status: 400 });
    }

    // 1. Fetch job syllabus and user's completed topics in parallel
    const [jobResult, trackerResult] = await Promise.all([
      supabase.from('jobs').select('exam_name, syllabus').eq('id', jobId).single(),
      supabase.from('study_tracker').select('topic').eq('user_id', userId).eq('job_id', jobId)
    ]);

    const { data: job, error: jobError } = jobResult;
    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found or could not be loaded." }, { status: 404 });
    }

    const { data: completed, error: trackerError } = trackerResult;
    if (trackerError) {
      console.error("Error fetching study tracker:", trackerError.message);
    }
    const completedTopics = completed ? completed.map(item => item.topic) : [];

    // 2. Calculate days remaining
    const daysRemaining = Math.max(0, Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24)));

    // 3. Call Groq AI
    const prompt = `You are an expert Indian government exam coach.
Exam: ${job.exam_name}
Days remaining: ${daysRemaining}
Syllabus: ${JSON.stringify(job.syllabus)}
Topics already completed by the user: ${completedTopics.join(', ')}

Generate a concise and effective study plan. Return ONLY valid JSON in the following structure:
{
  "today_tasks": [
    {"subject": "Quantitative Aptitude", "topic": "Percentage", "duration_mins": 45},
    {"subject": "Reasoning", "topic": "Coding-Decoding", "duration_mins": 30},
    {"subject": "General Awareness", "topic": "Current Affairs - Last 7 days", "duration_mins": 20}
  ],
  "weak_areas": ["Topics user should focus on, based on what's not completed"],
  "strong_areas": ["Topics from the completed list that are important"],
  "coverage_percent": ${Math.round((completedTopics.length / (Object.values(job.syllabus || {}).flat().length || 1)) * 100)},
  "daily_advice": "A short, motivational, and actionable tip for today's study session.",
  "priority_topics": ["List 3-5 most important topics to cover before the exam from the remaining syllabus."]
}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1024,
        response_format: { type: "json_object" }
      })
    });

    if (!groqRes.ok) throw new Error(`Groq API error: ${await groqRes.text()}`);

    const groqData = await groqRes.json();
    const studyPlan = JSON.parse(groqData.choices[0]?.message?.content);

    return NextResponse.json({ studyPlan });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}