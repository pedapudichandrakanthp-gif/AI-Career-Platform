import type { SupabaseClient } from "@supabase/supabase-js";

export async function userHasResume(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { count, error } = await supabase
    .from("resumes")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) {
    return false;
  }

  return (count ?? 0) > 0;
}
