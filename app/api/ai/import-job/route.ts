import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let jobText = body.text || "";

    if (body.url) {
      try {
        const res = await fetch(body.url);
        const html = await res.text();
        jobText = html.replace(/<[^>]*>?/gm, ' ').replace(/\s+/g, ' ').trim();
      } catch {
        return NextResponse.json({ error: "Failed to fetch URL" }, { status: 400 });
      }
    }

    if (!jobText) {
      return NextResponse.json({ error: "No text or URL provided." }, { status: 400 });
    }

    const prompt = `Extract government job details from this posting.
Return ONLY valid JSON, no markdown:
{
  "exam_name": "SSC CGL 2026",
  "title": "Combined Graduate Level Examination 2026",
  "conducting_body": "Staff Selection Commission",
  "job_level": "central",
  "state": "Central",
  "category": "SSC",
  "vacancies": 8400,
  "vacancies_ur": 3200,
  "vacancies_obc": 2100,
  "vacancies_sc": 1200,
  "vacancies_st": 600,
  "vacancies_ews": 800,
  "vacancies_pwd": 500,
  "age_min": 18,
  "age_max": 32,
  "qualification_required": "Bachelor's Degree",
  "pay_scale": "Pay Level 4-7 (₹25,500 - ₹1,51,100)",
  "application_start_date": "2026-07-15",
  "application_deadline": "2026-08-12",
  "exam_date": "2026-10-01",
  "result_date": null,
  "notification_pdf_url": "url or null",
  "official_website": "https://ssc.nic.in",
  "apply_link": "https://ssc.nic.in/apply",
  "description": "full description max 1500 chars",
  "status": "open"
}

Job posting text:
${jobText.substring(0, 15000)}`;

    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "llama-3.1-8b-instant",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1200,
        response_format: { type: "json_object" }
      })
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      throw new Error(`Groq API error: ${err}`);
    }

    const groqData = await groqRes.json();
    const content = groqData.choices[0]?.message?.content;
    const jobData = JSON.parse(content);

    return NextResponse.json({ job: jobData });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
