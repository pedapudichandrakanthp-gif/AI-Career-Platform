import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const PROTECTED = [
  '/dashboard',
  '/recommendations',
  '/saved-jobs',
  '/onboarding',
  '/resumes',
  '/profile',
  '/settings'
]

const PUBLIC = [
  '/login',
  '/register',
  '/verify-email'
]

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response = NextResponse.next({
              request,
            })
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // IMPORTANT: Use getSession instead of getUser for middleware
  const { data: { session } } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname
  const isProtected = PROTECTED.some(p => path.startsWith(p))
  const isPublic = PUBLIC.some(p => path.startsWith(p))

  // Redirect to login if no session on protected route
  if (!session && isProtected) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('from', path)
    return NextResponse.redirect(redirectUrl)
  }

  // Check email verification for protected routes
  if (session && isProtected) {
    const isGoogleUser = session.user.app_metadata?.provider === 'google'
    const isEmailConfirmed = !!session.user.email_confirmed_at

    // Google OAuth users are pre-verified, skip email check
    if (!isGoogleUser && !isEmailConfirmed) {
      return NextResponse.redirect(new URL('/verify-email', request.url))
    }
  }

  // Redirect to dashboard if logged in user visits login/register
  if (session && (path === '/login' || path === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/recommendations/:path*',
    '/saved-jobs/:path*',
    '/onboarding/:path*',
    '/resumes/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/login',
    '/register',
    '/verify-email'
  ]
}
