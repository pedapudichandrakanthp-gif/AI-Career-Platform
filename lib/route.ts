import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobTitle, jobDescription, userSkills } = body;

    if (!jobTitle) {
      return NextResponse.json(
        { error: "Missing job title" },
        { status: 400 }
      );
    }

    const prompt = `Generate 7 likely interview questions for ${jobTitle} role.
Job description: ${(jobDescription || "").substring(0, 400)}.
Candidate skills: ${userSkills || "Not specified"}.
For each question provide a brief answer tip.
Return ONLY valid JSON array:
[{"question": "string", "tip": "string", "type": "technical"|"behavioral"|"situational"}]`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      max_tokens: 800,
    });

    const rawContent = chatCompletion.choices[0]?.message?.content || "[]";
    
    // Robustly extract JSON array in case the LLM wrapped it in markdown code blocks
    const jsonMatch = rawContent.match(/\[[\s\S]*\]/);
    const cleanJson = jsonMatch ? jsonMatch[0] : "[]";
    const questions = JSON.parse(cleanJson);

    return NextResponse.json({ questions });
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return NextResponse.json(
      { error: "Failed to generate interview questions" },
      { status: 500 }
    );
  }
}