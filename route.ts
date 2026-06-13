import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { jobTitle, location, experienceYears, skills } = body;

    if (!jobTitle || !location) {
      return NextResponse.json(
        { error: "Missing required fields: jobTitle and location are required." },
        { status: 400 }
      );
    }

    const prompt = `Provide salary intelligence for ${jobTitle} with ${experienceYears || 0} years experience in ${location}.
Skills: ${(skills || []).join(", ") || "Not specified"}.
Return ONLY valid JSON:
{
  "min_salary": number,
  "max_salary": number,
  "median_salary": number,
  "currency": "USD"|"INR"|"GBP",
  "market_position": "below"|"competitive"|"above",
  "insight": "one sentence explanation"
}
Base on current 2025-2026 market data. For India use INR. Return purely the JSON object, do not wrap in markdown blocks.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama3-8b-8192",
      max_tokens: 200,
    });

    const rawContent = chatCompletion.choices[0]?.message?.content || "{}";
    
    // Extract JSON robustly in case the LLM wraps it in formatting
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    const cleanJson = jsonMatch ? jsonMatch[0] : "{}";
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching salary insight:", error);
    return NextResponse.json({ error: "Failed to generate salary insight" }, { status: 500 });
  }
}