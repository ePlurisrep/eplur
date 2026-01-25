import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { authenticate } from '@/lib/auth/authenticate'

function createSupabaseForRequest(request: NextRequest, supabaseResponseRef: { res: NextResponse }) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponseRef.res = NextResponse.next()
          cookiesToSet.forEach(({ name, value }) => supabaseResponseRef.res.cookies.set(name, value))
        },
      },
    }
  )
}

export async function GET(request: NextRequest) {
  // Try Bearer token authentication first, then fall back to Supabase session
  const auth = await authenticate(request)
  
  if (!auth.userId) {
    const unauth = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (auth.supabaseResponse) {
      for (const cookie of auth.supabaseResponse.cookies.getAll()) {
        unauth.cookies.set(cookie.name, cookie.value)
      }
    }
    return unauth
  }

  // Use Supabase client if available (from session), otherwise create one with service role
  let supabase = auth.supabase
  let supabaseResponse = auth.supabaseResponse || NextResponse.next()
  
  if (!supabase) {
    supabase = createSupabaseForRequest(request, { res: supabaseResponse })
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', auth.userId)
    .order('created_at', { ascending: false })

  if (error) {
    const res = NextResponse.json({ error: error.message }, { status: 500 })
    for (const cookie of supabaseResponse.cookies.getAll()) {
      res.cookies.set(cookie.name, cookie.value)
    }
    return res
  }

  const res = NextResponse.json(data || [])
  for (const cookie of supabaseResponse.cookies.getAll()) {
    res.cookies.set(cookie.name, cookie.value)
  }
  return res
}

export async function POST(request: NextRequest) {
  // Try Bearer token authentication first, then fall back to Supabase session
  const auth = await authenticate(request)
  
  if (!auth.userId) {
    const unauth = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (auth.supabaseResponse) {
      for (const cookie of auth.supabaseResponse.cookies.getAll()) {
        unauth.cookies.set(cookie.name, cookie.value)
      }
    }
    return unauth
  }

  const body = await request.json()
  const source = body.source || 'upload'
  const metadata = body.metadata || {}

  // Use Supabase client if available (from session), otherwise create one with service role
  let supabase = auth.supabase
  let supabaseResponse = auth.supabaseResponse || NextResponse.next()
  
  if (!supabase) {
    supabase = createSupabaseForRequest(request, { res: supabaseResponse })
  }

  const { data, error } = await supabase
    .from('documents')
    .insert([{ user_id: auth.userId, source, metadata }])
    .select()
    .single()

  if (error) {
    const res = NextResponse.json({ error: error.message }, { status: 500 })
    for (const cookie of supabaseResponse.cookies.getAll()) {
      res.cookies.set(cookie.name, cookie.value)
    }
    return res
  }

  const res = NextResponse.json(data, { status: 201 })
  for (const cookie of supabaseResponse.cookies.getAll()) {
    res.cookies.set(cookie.name, cookie.value)
  }
  return res
}
