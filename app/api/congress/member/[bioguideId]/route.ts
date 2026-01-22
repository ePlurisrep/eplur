import { NextResponse } from 'next/server'

const API_KEY = process.env.CONGRESS_API_KEY
const BASE = 'https://api.congress.gov/v3'

export async function GET(_req: Request, { params }: { params: { bioguideId: string } }) {
  const { bioguideId } = params

  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing CONGRESS_API_KEY' }, { status: 500 })
  }

  const res = await fetch(`${BASE}/member/${encodeURIComponent(bioguideId)}?api_key=${API_KEY}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Congress API error' }, { status: 500 })
  }

  const data = await res.json()
  const m = data.member ?? data

  const member = {
    bioguideId: m.bioguideId || m.id,
    name: m.name,
    chamber: m.chamber,
    state: m.state,
    party: m.partyName || m.party,
    district: m.district,
    imageUrl: m.depiction?.imageUrl || m.imageUrl,
    terms: (m.terms || []).map((t: any) => ({
      congress: t.congress,
      startYear: t.startYear || (t.start && new Date(t.start).getFullYear()),
      endYear: t.endYear || (t.end && new Date(t.end).getFullYear()),
      party: t.party || t.partyName,
    })),
    contact: {
      website: m.url || m.website,
      phone: m.phone,
      office: m.office,
    },
  }

  return NextResponse.json({ member })
}
