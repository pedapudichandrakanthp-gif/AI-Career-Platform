import { NextRequest } from "next/server";

import { createAuthenticatedClient } from "@/lib/supabase/server";

export async function getAuthenticatedUser(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, supabase: null, error: "Missing authorization token." };
  }

  const accessToken = authHeader.slice(7);
  const supabase = createAuthenticatedClient(accessToken);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { user: null, supabase: null, error: error?.message ?? "Unauthorized." };
  }

  return { user, supabase, error: null };
}
