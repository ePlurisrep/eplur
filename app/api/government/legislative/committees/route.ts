import { NextResponse } from 'next/server'

const API_KEY = process.env.CONGRESS_API_KEY
const BASE = 'https://api.congress.gov/v3'

export async function GET() {
  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing CONGRESS_API_KEY' }, { status: 500 })
  }

  const res = await fetch(`${BASE}/committee?limit=250&api_key=${API_KEY}`, { next: { revalidate: 3600 } })
  if (!res.ok) return NextResponse.json({ error: 'Congress API error' }, { status: 500 })

  const data = await res.json()

  const committees = (data.committees ?? []).map((c: any) => ({
    code: c.code || c.committeeCode || c.id,
    name: c.name,
    chamber: c.chamber || (c.house ? 'House' : c.senate ? 'Senate' : null),
    externalId: c.id,
  }))

  return NextResponse.json({ committees }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
}
