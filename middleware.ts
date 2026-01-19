import { NextRequest, NextResponse } from 'next/server'

// Call server-side session proxy to enforce protected routes without
// importing server-only code into the edge middleware.
export async function middleware(request: NextRequest) {
  const origin = request.nextUrl.origin
  try {
    const res = await fetch(`${origin}/api/_supabase/session`, {
      method: 'GET',
      headers: {
        // Forward cookies so the server can read session
        cookie: request.headers.get('cookie') || '',
      },
      // ensure we don't follow redirects automatically
      redirect: 'manual' as RequestRedirect
    })

    // If the proxy returned a redirect, follow it at the edge
    if (res.status === 302 || res.status === 307) {
      const location = res.headers.get('location') || '/login'
      return NextResponse.redirect(location)
    }

    if (res.status === 200) {
      return NextResponse.next()
    }

    // For 401/403 or other failure statuses, redirect to login
    if (res.status === 401 || res.status === 403) {
      const loginUrl = new URL('/login', origin)
      return NextResponse.redirect(loginUrl)
    }

    return NextResponse.next()
  } catch (err) {
    // In case of errors calling the proxy, fall back to allowing the request
    // to proceed (avoid taking down the site). Log to console for diagnosis.
    console.warn('Session proxy error in middleware:', err)
    return NextResponse.next()
  }
}

export const config = {
  matcher: ['/vault', '/vault/:path*', '/api/:path*'],
}
