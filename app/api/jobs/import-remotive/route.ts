import { NextRequest, NextResponse } from "next/server";

import { isAdmin } from "@/lib/auth/admin";
import { getAuthenticatedUser } from "@/lib/api/auth";
import { importRemotiveJobs } from "@/lib/jobs/import-remotive";
import { createServiceClient } from "@/lib/supabase/server";

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
    const result = await importRemotiveJobs(supabase);

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
