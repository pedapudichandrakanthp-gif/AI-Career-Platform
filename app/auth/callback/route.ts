import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type");

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

  // Handle email confirmation (type=email_confirmation)
  if (type === 'email_confirmation') {
    // Email is now confirmed, check profile status
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

  // Handle OAuth callback (type=oauth or no type)
  const isGoogleUser = data.user.app_metadata?.provider === 'google';
  
  // Google OAuth users are pre-verified, skip email check
  if (isGoogleUser) {
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

  // For email/password users without email confirmation, redirect to verify-email
  if (!data.user.email_confirmed_at) {
    return NextResponse.redirect(`${origin}/verify-email`);
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
