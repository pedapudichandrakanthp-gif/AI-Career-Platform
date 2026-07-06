import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/api/auth";
import { buildProfileFromExtracted, mergeExtractedProfile } from "@/lib/profile/merge";
import type { ExtractedProfile } from "@/types/ai";
import type { UserProfileRow } from "@/types/database";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user || !auth.supabase) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized." }, { status: 401 });
  }

  try {
    const body = (await request.json()) as {
      profile: ExtractedProfile;
      overwriteEmptyOnly?: boolean;
    };

    if (!body.profile) {
      return NextResponse.json({ error: "Profile data is required." }, { status: 400 });
    }

    const { data: existing } = await auth.supabase
      .from("profiles")
      .select("*")
      .eq("user_id", auth.user.id)
      .maybeSingle();

    const updatePayload = body.overwriteEmptyOnly
      ? mergeExtractedProfile(existing as UserProfileRow | null, body.profile)
      : buildProfileFromExtracted(body.profile);

    if (Object.keys(updatePayload).length <= 1) {
      return NextResponse.json({ message: "No new profile fields to update." });
    }

    updatePayload.profile_complete = true;

    const { error } = await auth.supabase
      .from("profiles")
      .upsert({ ...updatePayload, user_id: auth.user.id }, { onConflict: 'user_id' });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Profile saved successfully." });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save profile.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
