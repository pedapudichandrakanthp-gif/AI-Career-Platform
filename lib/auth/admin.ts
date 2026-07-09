import type { SupabaseClient } from "@supabase/supabase-js";

// Authoritative source: public.users.role (default 'user', set to 'admin' manually).
// Do NOT query auth.users — it is not accessible via the Supabase REST API.
export async function isAdmin(supabase: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await supabase.from("users").select("role").eq("id", userId).maybeSingle();

  return data?.role === "admin";
}
