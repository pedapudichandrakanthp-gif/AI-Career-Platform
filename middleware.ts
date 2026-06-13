import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard','/recommendations','/saved-jobs','/onboarding','/resumes','/profile','/settings']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (n) => request.cookies.get(n)?.value, set: () => {}, remove: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname
  if (!session && PROTECTED.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL(`/login?from=${encodeURIComponent(path)}`, request.url))
  }
  return response
}

export const config = {
  matcher: ['/dashboard/:path*','/recommendations/:path*','/saved-jobs/:path*','/onboarding/:path*','/resumes/:path*','/profile/:path*','/settings/:path*']
}
