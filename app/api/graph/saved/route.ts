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
    const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    for (const cookie of supabaseResponse.cookies.getAll()) {
      res.cookies.set(cookie.name, cookie.value)
    }
    return res
  }

  const { data, error } = await supabase
    .from('saved_graphs')
    .select('id, name, created_at, public, share_id')
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
    const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    for (const cookie of supabaseResponse.cookies.getAll()) {
      res.cookies.set(cookie.name, cookie.value)
    }
    return res
  }

  const body = await request.json()
  const { name, config, public: isPublic } = body

  if (!config) {
    const res = NextResponse.json({ error: 'config required' }, { status: 400 })
    for (const cookie of supabaseResponse.cookies.getAll()) {
      res.cookies.set(cookie.name, cookie.value)
    }
    return res
  }

  const shareId = isPublic ? crypto.randomUUID() : null

  const insertBody: any = {
    user_id: user.id,
    name: name || null,
    config,
    public: !!isPublic,
  }
  if (shareId) insertBody.share_id = shareId

  const { data, error } = await supabase.from('saved_graphs').insert(insertBody).select().single()

  if (error) {
    const res = NextResponse.json({ error: error.message }, { status: 500 })
    for (const cookie of supabaseResponse.cookies.getAll()) {
      res.cookies.set(cookie.name, cookie.value)
    }
    return res
  }

  const res = NextResponse.json(data)
  for (const cookie of supabaseResponse.cookies.getAll()) {
    res.cookies.set(cookie.name, cookie.value)
  }
  return res
}
