import { NextRequest, NextResponse } from 'next/server'
import { searchAll } from '../../../../lib/search/searchAll'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    if (!q) return NextResponse.json({ error: 'query param required' }, { status: 400 })

    const cookies = request.headers.get('cookie') || null
    const baseUrl = url.origin

    const results = await searchAll(q, { cookies, baseUrl })

    return NextResponse.json(results)
  } catch (err: any) {
    console.error('Proxy search error:', err)
    return NextResponse.json({ error: err?.message || 'search error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Support POST as well (JSON body with { q })
  try {
    const body = await request.json().catch(() => ({}))
    const q = body.q || ''
    if (!q) return NextResponse.json({ error: 'q required' }, { status: 400 })

    const cookies = request.headers.get('cookie') || null
    const baseUrl = new URL(request.url).origin

    const results = await searchAll(q, { cookies, baseUrl })
    return NextResponse.json(results)
  } catch (err: any) {
    console.error('Proxy search POST error:', err)
    return NextResponse.json({ error: err?.message || 'search error' }, { status: 500 })
  }
}
