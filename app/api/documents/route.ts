import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

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
  let supabaseResponse = NextResponse.next()
  const supabase = createSupabaseForRequest(request, { res: supabaseResponse })

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) {
    const unauth = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    for (const cookie of supabaseResponse.cookies.getAll()) {
      unauth.cookies.set(cookie.name, cookie.value)
    }
    return unauth
  }

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user.id)
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
  let supabaseResponse = NextResponse.next()
  const supabase = createSupabaseForRequest(request, { res: supabaseResponse })

  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user
  if (!user) {
    const unauth = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    for (const cookie of supabaseResponse.cookies.getAll()) {
      unauth.cookies.set(cookie.name, cookie.value)
    }
    return unauth
  }

  const body = await request.json()
  const source = body.source || 'upload'
  const metadata = body.metadata || {}

  const { data, error } = await supabase
    .from('documents')
    .insert([{ user_id: user.id, source, metadata }])
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
