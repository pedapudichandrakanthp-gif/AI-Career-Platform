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

    const currentDate = new Date().toISOString();

    // Update all jobs where application_deadline < current date to is_active = false
    const { error, count } = await supabase
      .from("jobs")
      .update({ is_active: false })
      .lt("application_deadline", currentDate)
      .eq("is_active", true);

    if (error) {
      return NextResponse.json(
        { error: "Failed to expire exams", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Expired exams updated successfully",
      expiredCount: count,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
