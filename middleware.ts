import { NextRequest } from 'next/server'
import updateSession from './lib/supabase/proxy'

export function middleware(request: NextRequest) {
  return updateSession(request)
}

export const config = {
  matcher: ['/vault', '/vault/:path*', '/api/:path*'],
}
