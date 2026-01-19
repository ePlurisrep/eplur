import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { generateSimilarityGraph } from '../../../lib/engine'

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
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponseRef.res.cookies.set(name, value, options))
        },
      },
    }
  )
}

export async function POST(request: NextRequest) {
  let supabaseResponse = NextResponse.next()
  try {
    const body = await request.json()
    const { documentIds, threshold } = body

    if (!Array.isArray(documentIds) || documentIds.length === 0) {
      return NextResponse.json({ error: 'documentIds required' }, { status: 400 })
    }

    const supabase = createSupabaseForRequest(request, { res: supabaseResponse })

    // Ensure authenticated user
    const { data: userData } = await supabase.auth.getUser()
    const user = userData?.user
    if (!user) {
      const res = NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      res.cookies.setAll(supabaseResponse.cookies.getAll())
      return res
    }

    // Check billing — active subscribers bypass free limit
    const { data: billingRow } = await supabase.from('billing').select('status, plan').eq('user_id', user.id).single()
    const isSubscriber = billingRow?.status === 'active'

    // Check usage only for non-subscribers
    const FREE_LIMIT = 5
    if (!isSubscriber) {
      const { data: usageRows, error: usageError } = await supabase
        .from('usage')
        .select('graphs_generated')
        .eq('user_id', user.id)
        .single()

      if (usageError && usageError.code !== 'PGRST116') {
        // ignore missing row
      }

      const graphsGenerated = usageRows?.graphs_generated || 0
      if (graphsGenerated >= FREE_LIMIT) {
        const res = NextResponse.json({ error: 'Free graph generation limit reached', upgrade: true }, { status: 403 })
        res.cookies.setAll(supabaseResponse.cookies.getAll())
        return res
      }
    }

    // Generate graph
    const graph = await generateSimilarityGraph(documentIds, Number(threshold) || 0.1)

    // Increment usage (create row if missing)
    if (usageRows) {
      await supabase
        .from('usage')
        .update({ graphs_generated: graphsGenerated + 1, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
    } else {
      await supabase
        .from('usage')
        .insert({ user_id: user.id, graphs_generated: 1 })
    }

    const res = NextResponse.json({ graph })
    res.cookies.setAll(supabaseResponse.cookies.getAll())
    return res
  } catch (err: any) {
    const res = NextResponse.json({ error: err?.message || 'Unknown error' }, { status: 500 })
    res.cookies.setAll((supabaseResponse && supabaseResponse.cookies && supabaseResponse.cookies.getAll && supabaseResponse.cookies.getAll()) || [])
    return res
  }
}
