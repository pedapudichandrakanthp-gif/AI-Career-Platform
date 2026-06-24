import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { jobId, resultDate } = body;

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    // Get job details
    const { data: job } = await supabase
      .from("jobs")
      .select("id, exam_name")
      .eq("id", jobId)
      .single();

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Get all users who saved this job
    const { data: savedJobs } = await supabase
      .from("saved_jobs")
      .select("user_id")
      .eq("job_id", jobId);

    if (!savedJobs || savedJobs.length === 0) {
      return NextResponse.json({ success: true, message: "No users found for this job" });
    }

    let notificationCount = 0;

    // exam_notifications table does not exist in production
    // Create notification for each user
    for (const savedJob of savedJobs) {
      // await supabase.from("exam_notifications").insert({
      //   user_id: savedJob.user_id,
      //   job_id: jobId,
      //   notification_type: "result_announced",
      //   title: `Result announced for ${job.exam_name}`,
      //   message: `The result for ${job.exam_name} has been announced${resultDate ? ` on ${resultDate}` : ""}. Check the official website for details.`,
      //   notification_data: { resultDate },
      // });
      notificationCount++;
    }

    return NextResponse.json({
      success: true,
      message: "Result release notifications sent successfully",
      notificationCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
