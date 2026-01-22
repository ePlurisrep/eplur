import { NextResponse } from 'next/server'

const API_KEY = process.env.CONGRESS_API_KEY
const BASE = 'https://api.congress.gov/v3'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const { code } = params

  if (!API_KEY) {
    return NextResponse.json({ error: 'Missing CONGRESS_API_KEY' }, { status: 500 })
  }

  const res = await fetch(`${BASE}/committee/${encodeURIComponent(code)}?api_key=${API_KEY}`, {
    next: { revalidate: 3600 },
  })

  if (!res.ok) {
    return NextResponse.json({ error: 'Congress API error' }, { status: 500 })
  }

  const data = await res.json()
  const c = data.committee ?? data

  const committee = {
    code: c.code || c.committeeCode || c.id,
    name: c.name,
    jurisdiction: c.jurisdiction || c.chamber,
    description: c.description,
    members: (c.members || []).map((m: any) => ({ name: m.name, role: m.role, party: m.party })),
  }

  return NextResponse.json({ committee })
}
