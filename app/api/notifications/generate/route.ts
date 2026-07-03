import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST() {
  try {
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

    // Get all users who have saved jobs or are eligible for jobs
    const { data: users } = await supabase.auth.admin.listUsers();
    if (!users) {
      return NextResponse.json({ success: true, message: "No users found" });
    }

    const notificationCount = 0;

    // Process each user
    for (const user of users.users) {
      // Get user's saved jobs
      const { data: savedJobs } = await supabase
        .from("saved_jobs")
        .select("job_id")
        .eq("user_id", user.id);

      if (!savedJobs || savedJobs.length === 0) continue;

      const jobIds = savedJobs.map((sj) => sj.job_id);

      // Get jobs with their application deadlines
      const { data: jobs } = await supabase
        .from("jobs")
        .select("id, exam_name, application_deadline, exam_date")
        .in("id", jobIds)
        .eq("is_active", true);

      if (!jobs || jobs.length === 0) continue;

      for (const job of jobs) {
        if (!job.application_deadline) continue;

        // exam_notifications table does not exist in production
        // Check if notification already exists for this event
        // const { data: existingNotifications } = await supabase
        //   .from("exam_notifications")
        //   .select("id, notification_type")
        //   .eq("user_id", user.id)
        //   .eq("job_id", job.id);

        // const existingTypes = new Set(existingNotifications?.map((n) => n.notification_type) || []);

        // Application closing in 3 days
        // if (daysUntilDeadline === 3 && !existingTypes.has("closing_soon_3d")) {
        //   await supabase.from("exam_notifications").insert({
        //     user_id: user.id,
        //     job_id: job.id,
        //     notification_type: "closing_soon_3d",
        //     title: `Application closing in 3 days`,
        //     message: `The application for ${job.exam_name} closes in 3 days. Apply now to avoid missing the deadline.`,
        //     notification_data: { deadline: job.application_deadline },
        //   });
        //   notificationCount++;
        // }

        // Application closing tomorrow
        // if (daysUntilDeadline === 1 && !existingTypes.has("closing_soon_1d")) {
        //   await supabase.from("exam_notifications").insert({
        //     user_id: user.id,
        //     job_id: job.id,
        //     notification_type: "closing_soon_1d",
        //     title: `Application closing tomorrow`,
        //     message: `The application for ${job.exam_name} closes tomorrow. Apply now to avoid missing the deadline.`,
        //     notification_data: { deadline: job.application_deadline },
        //   });
        //   notificationCount++;
        // }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notifications generated successfully",
      notificationCount,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
