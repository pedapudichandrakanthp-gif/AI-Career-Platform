import type { SupabaseClient } from "@supabase/supabase-js";

export async function isDuplicateJob(
  supabase: SupabaseClient,
  title: string,
  companyName: string,
  location: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("jobs")
    .select("id")
    .ilike("title", title.trim())
    .ilike("company_name", companyName.trim())
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
