import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'

type CookieSet = { name: string; value: string; options?: Record<string, any> }

function serializeCookie(c: CookieSet) {
  const { name, value, options } = c
  let str = `${name}=${encodeURIComponent(value)}`
  if (!options) return str
  if (options.maxAge != null) str += `; Max-Age=${options.maxAge}`
  if (options.expires) str += `; Expires=${new Date(options.expires).toUTCString()}`
  if (options.path) str += `; Path=${options.path}`
  if (options.httpOnly) str += `; HttpOnly`
  if (options.secure) str += `; Secure`
  if (options.sameSite) str += `; SameSite=${options.sameSite}`
  return str
}

export async function updateSession(request: NextRequest) {
  const cookiesToSet: CookieSet[] = []

  // With Fluid compute, don't put this client in a global environment
  // variable. Always create a new one on each request.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(list: CookieSet[]) {
          list.forEach((c) => cookiesToSet.push(c))
        },
      },
    }
  )

  const { data } = await supabase.auth.getClaims()
  const user = data?.claims

  // Helper to attach Set-Cookie headers to a Response
  const makeResponse = (body: BodyInit | null, status = 200, extraHeaders?: HeadersInit) => {
    const headers = new Headers(extraHeaders)
    for (const c of cookiesToSet) headers.append('set-cookie', serializeCookie(c))
    return new Response(body, { status, headers })
  }

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    const loginUrl = new URL('/login', request.nextUrl.origin)
    return makeResponse(null, 302, { location: loginUrl.toString() })
  }

  return makeResponse(JSON.stringify({ ok: true }), 200, { 'content-type': 'application/json' })
}

export default updateSession
