import { NextRequest, NextResponse } from 'next/server'
import { searchDataGov } from '@/lib/adapters/dataGov'

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const q = url.searchParams.get('q') || ''
    if (!q) return NextResponse.json({ error: 'query param required' }, { status: 400 })

    const results = await searchDataGov(q)
    return NextResponse.json(results)
  } catch (err: any) {
    console.error('Data.gov proxy error:', err)
    return NextResponse.json({ error: err?.message || 'data.gov error' }, { status: 500 })
  }
}
