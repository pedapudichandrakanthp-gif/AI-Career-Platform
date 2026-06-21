import type { SupabaseClient } from "@supabase/supabase-js";

export async function isDuplicateJob(
  supabase: SupabaseClient,
  examName: string,
  conductingBody: string,
  location: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("jobs")
    .select("id")
    .ilike("exam_name", examName.trim())
    .ilike("conducting_body", conductingBody.trim())
    .ilike("location", location.trim())
    .maybeSingle();

  return Boolean(data);
}

export async function isDuplicateByExternalId(
  supabase: SupabaseClient,
  externalId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("jobs")
    .select("id")
    .eq("external_id", externalId)
    .maybeSingle();

  return Boolean(data);
}
