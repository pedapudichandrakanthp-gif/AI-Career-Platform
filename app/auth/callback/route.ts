import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=oauth_no_code`);
  }

  const cookieStore = await cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
  
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  
  if (error) {
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`);
  }

  // Check if user profile is complete
  const { data: profile } = await supabase
    .from('profiles')
    .select('profile_complete')
    .eq('user_id', data.user.id)
    .single();

  // Redirect to onboarding if profile doesn't exist or is not complete
  if (!profile || !profile.profile_complete) {
    return NextResponse.redirect(`${origin}/onboarding`);
  }

  // Redirect to dashboard if profile is complete
  return NextResponse.redirect(`${origin}/dashboard`);
}
