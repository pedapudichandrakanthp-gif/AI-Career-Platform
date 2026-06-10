import { NextRequest, NextResponse } from "next/server";

import { generateJsonFromText } from "@/lib/ai/groq";
import { CAREER_ROADMAP_PROMPT } from "@/lib/ai/prompts";
import { aiErrorResponse } from "@/lib/ai/route-handler";
import { getAuthenticatedUser } from "@/lib/api/auth";
import type { CareerRoadmapData } from "@/types/ai";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user || !auth.supabase) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as { target_role?: string };

    if (!body.target_role?.trim()) {
      return NextResponse.json({ error: "target_role is required." }, { status: 400 });
    }

    const { data: profile } = await auth.supabase
      .from("users")
      .select("*")
      .eq("id", auth.user.id)
      .maybeSingle();

    const profileContext = [
      `Target Role: ${body.target_role}`,
      profile?.skills?.length ? `Current Skills: ${profile.skills.join(", ")}` : "",
      profile?.education ? `Education: ${profile.education}` : "",
      profile?.experience_years != null ? `Experience: ${profile.experience_years} years` : "",
      profile?.location ? `Location: ${profile.location}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const roadmap = await generateJsonFromText<CareerRoadmapData>(
      CAREER_ROADMAP_PROMPT,
      profileContext,
    );

    const { data: saved } = await auth.supabase
      .from("career_roadmaps")
      .insert([
        {
          user_id: auth.user.id,
          target_role: body.target_role,
          current_skills: roadmap.current_skills ?? [],
          recommended_skills: roadmap.recommended_skills ?? [],
          courses: roadmap.courses ?? [],
          certifications: roadmap.certifications ?? [],
          roadmap_data: roadmap,
        },
      ])
      .select("*")
      .single();

    return NextResponse.json({ roadmap, saved });
  } catch (error) {
    return aiErrorResponse("career-roadmap", error);
  }
}
