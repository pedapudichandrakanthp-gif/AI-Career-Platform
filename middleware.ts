import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/dashboard', '/recommendations', '/saved-jobs', '/onboarding']

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => request.cookies.get(name)?.value,
        set: (name: string, value: string, options: any) => {
          // Set cookie on the response
          response.cookies.set({
            name,
            value,
            ...options
          })
        },
        remove: (name: string, options: any) => {
          // Remove cookie from the response
          response.cookies.set({
            name,
            value: '',
            ...options,
            maxAge: -1
          })
        }
      }
    }
  )
  const { data: { session } } = await supabase.auth.getSession()
  const path = request.nextUrl.pathname
  if (!session && PROTECTED.some(p => path.startsWith(p))) {
    return NextResponse.redirect(new URL(`/login?from=${path}`, request.url))
  }
  return response
}

export const config = { matcher: ['/dashboard/:path*', '/recommendations/:path*', '/saved-jobs/:path*', '/onboarding/:path*'] }
