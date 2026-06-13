import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobTitle, company, jobDescription, userProfile } = body;

    if (!jobTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const prompt = `Write a professional cover letter for ${jobTitle} at ${company || "the company"}.
Candidate profile: ${userProfile?.summary || "Experienced professional"}, Skills: ${userProfile?.skills || "N/A"}.
Job requirements: ${(jobDescription || "").substring(0, 500)}.
Keep it under 250 words. Professional tone. No placeholders.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama3-8b-8192",
      max_tokens: 400,
    });

    const coverLetter = chatCompletion.choices[0]?.message?.content || "";

    return NextResponse.json({ coverLetter });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      { error: "Failed to generate cover letter" },
      { status: 500 }
    );
  }
}