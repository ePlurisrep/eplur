import { NextResponse } from 'next/server'
import type { GovernmentNode } from '@/types/government'

const BASE = 'https://api.congress.gov/v3'
const API_KEY = process.env.CONGRESS_API_KEY || process.env.CONGRESS_API_KEY

function normalizeCommittee(c: any): GovernmentNode {
  return {
    id: `committee:${c.code || c.committeeCode || c.id}`,
    type: 'committee',
    name: c.name || '',
    parentId: c.chamber ? `body:${c.chamber.toLowerCase()}` : undefined,
    metadata: { committeeType: c.committeeType || c.type || null },
    sources: { congressGovId: c.code || c.committeeCode || String(c.id), url: `${BASE}/committee/${c.id}` },
  }
}

function normalizeMember(m: any): GovernmentNode {
  const latest = (m.terms || [])[0]
  return {
    id: `member:${m.bioguideId || m.id}`,
    type: 'member',
    name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || '',
    parentId: m.chamber ? `body:${m.chamber.toLowerCase()}` : undefined,
    metadata: { state: m.state || null, party: m.party || null },
    sources: { congressGovId: m.bioguideId || String(m.id), url: `${BASE}/member/${m.id}` },
    startDate: latest?.start || undefined,
    endDate: latest?.end ?? null,
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const type = url.searchParams.get('type')
  const id = url.searchParams.get('id')

  if (!type || !id) return NextResponse.json({ error: 'Missing type or id' }, { status: 400 })
  if (!API_KEY) return NextResponse.json({ error: 'Missing CONGRESS_API_KEY' }, { status: 500 })

  try {
    if (type === 'committee') {
      const res = await fetch(`${BASE}/committee/${encodeURIComponent(id)}?api_key=${API_KEY}`, { next: { revalidate: 3600 } })
      if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const json = await res.json()
      const entity = normalizeCommittee(json)
      return NextResponse.json({ entity }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } })
    }

    if (type === 'member') {
      const res = await fetch(`${BASE}/member/${encodeURIComponent(id)}?api_key=${API_KEY}`, { next: { revalidate: 3600 } })
      if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
      const json = await res.json()
      const entity = normalizeMember(json)
      return NextResponse.json({ entity }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } })
    }

    return NextResponse.json({ error: 'Unsupported type' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: 'Fetch error' }, { status: 502 })
  }
}
