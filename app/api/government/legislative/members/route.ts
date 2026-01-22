import { NextResponse } from 'next/server'

const API_KEY = process.env.CONGRESS_API_KEY
const BASE = 'https://api.congress.gov/v3'

export async function GET() {
  if (!API_KEY) return NextResponse.json({ error: 'Missing CONGRESS_API_KEY' }, { status: 500 })

  const res = await fetch(`${BASE}/member?limit=250&api_key=${API_KEY}`, { next: { revalidate: 3600 } })
  if (!res.ok) return NextResponse.json({ error: 'Congress API error' }, { status: 500 })

  const data = await res.json()

  const members = (data.members ?? []).map((m: any) => ({
    bioguideId: m.bioguideId || m.id,
    name: m.name,
    chamber: m.chamber,
    state: m.state,
    party: m.partyName || m.party,
    imageUrl: m.depiction?.imageUrl || m.imageUrl,
    terms: (m.terms || []).map((t: any) => ({
      congress: t.congress,
      startYear: t.startYear || (t.start && new Date(t.start).getFullYear()),
      endYear: t.endYear || (t.end && new Date(t.end).getFullYear()),
      party: t.party || t.partyName,
    })),
  }))

  return NextResponse.json({ members }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
}
