import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/api/auth";
import { generateAndStoreMatchScoresForUser } from "@/lib/matching/matchScores";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user || !auth.supabase) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized." }, { status: 401 });
  }

  try {
    const result = await generateAndStoreMatchScoresForUser(auth.supabase, auth.user.id);

    return NextResponse.json({
      generatedCount: result.generatedCount,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to generate match scores.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
