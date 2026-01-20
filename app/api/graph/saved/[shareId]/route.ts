import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ shareId: string }> }
) {
  // Use server client (no cookies needed) to fetch public saved graph
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: { getAll() { return [] }, setAll() {} }
  })

  const { shareId } = await context.params

  if (!shareId) {
    return NextResponse.json({ error: 'Missing shareId' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('saved_graphs')
    .select('id, name, config, public, share_id')
    .eq('share_id', shareId)
    .eq('public', true)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}
