import { NextRequest, NextResponse } from 'next/server'
import { searchAll } from '../../../../lib/search/searchAll'
import { normalizeSearchResult } from '@/lib/normalizeSearchResult'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    if (!q) return NextResponse.json({ error: 'query param required' }, { status: 400 })

    const cookies = request.headers.get('cookie') || null
    const baseUrl = url.origin

    // Additional optional filters (accepted but currently delegated to adapters)
    const type = url.searchParams.get('type') ?? undefined
    const jurisdiction = url.searchParams.get('jurisdiction') ?? undefined
    const agency = url.searchParams.get('agency') ?? undefined
    const from = url.searchParams.get('from') ?? undefined
    const to = url.searchParams.get('to') ?? undefined

    const results = await searchAll(q, { cookies, baseUrl })

    const raw = results?.results ?? (Array.isArray(results) ? results : [])
    const records = raw.map((r: any, i: number) => normalizeSearchResult(r, i))

    return NextResponse.json({ records, results: raw })
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
    const raw = results?.results ?? (Array.isArray(results) ? results : [])
    const records = raw.map((r: any, i: number) => normalizeSearchResult(r, i))
    return NextResponse.json({ records, results: raw })
  } catch (err: any) {
    console.error('Proxy search POST error:', err)
    return NextResponse.json({ error: err?.message || 'search error' }, { status: 500 })
  }
}
