import { NextResponse } from "next/server";

import { createServiceClient } from "@/lib/supabase/server";
import { importRemotiveJobs } from "@/lib/jobs/import-remotive";

export async function POST() {
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
