import { NextResponse } from 'next/server'

const API_KEY = process.env.CONGRESS_API_KEY
const BASE = 'https://api.congress.gov/v3'

export async function GET(request: Request) {
  if (!API_KEY) return NextResponse.json({ error: 'Missing CONGRESS_API_KEY' }, { status: 500 })

  const url = new URL(request.url)
  const congress = url.searchParams.get('congress') || ''
  const qs = congress ? `?congress=${encodeURIComponent(congress)}&limit=100&api_key=${API_KEY}` : `?limit=100&api_key=${API_KEY}`

  const res = await fetch(`${BASE}/bill${qs}`, { next: { revalidate: 3600 } })
  if (!res.ok) return NextResponse.json({ error: 'Congress API error' }, { status: 500 })

  const data = await res.json()

  const bills = (data.bills ?? []).map((b: any) => ({
    billNumber: b.number || b.billNumber,
    title: b.title,
    summary: b.summary || b.title,
    congress: b.congress,
    sponsor: b.sponsor?.bioguideId || b.sponsor?.id || null,
    externalId: b.id,
  }))

  return NextResponse.json({ bills }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
}
