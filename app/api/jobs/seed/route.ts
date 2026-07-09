import { NextRequest, NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/admin";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { createServiceClient } from "@/lib/supabase/server";
import { importRemotiveJobs } from "@/lib/jobs/import-remotive";

export async function POST(request: NextRequest) {
  const auth = await getAuthenticatedUser(request);

  if (!auth.user || !auth.supabase) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized." }, { status: 401 });
  }

  const admin = await isAdmin(auth.supabase, auth.user.id);

  if (!admin) {
    return NextResponse.json({ error: "Admin access required." }, { status: 403 });
  }

  try {
    const supabase = createServiceClient();

    // Check if jobs table is empty
    const { count, error: countError } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    if (countError) {
      return NextResponse.json({ error: countError.message }, { status: 500 });
    }

    // If jobs exist, return early
    if (count && count > 0) {
      return NextResponse.json({ 
        message: "Jobs already exist in database",
        count,
        seeded: false
      });
    }

    // Import jobs from Remotive
    const result = await importRemotiveJobs(supabase);

    return NextResponse.json({
      message: "Jobs seeded successfully",
      ...result,
      seeded: true
    });
  } catch (error) {
    console.error("Seed jobs error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to seed jobs" },
      { status: 500 }
    );
  }
}
