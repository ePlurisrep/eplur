import { NextResponse } from 'next/server'
import { GOVERNMENT_ENTITIES } from '@/lib/government/entities'
import type { GovernmentNode } from '@/types/government'

const API_KEY = process.env.CONGRESS_API_KEY
const BASE = 'https://api.congress.gov/v3'

function normalizeCommittee(c: any): GovernmentNode {
  return {
    id: `committee:${c.code || c.committeeCode || c.id}`,
    type: 'committee',
    name: c.name || '',
    parentId: c.chamber ? `body:${c.chamber.toLowerCase()}` : null,
    metadata: { committeeType: c.committeeType || null, jurisdiction: c.jurisdiction || null },
    sources: { congressGovId: c.code || c.committeeCode || String(c.id) },
  }
}

function normalizeMember(m: any): GovernmentNode {
  const latestTerm = (m.terms || [])[0]
  return {
    id: `member:${m.bioguideId || m.id}`,
    type: 'member',
    name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || '',
    parentId: m.chamber ? `body:${m.chamber.toLowerCase()}` : null,
    metadata: { state: m.state || null },
    sources: { congressGovId: m.bioguideId || String(m.id) },
    startDate: latestTerm?.start || undefined,
    endDate: latestTerm?.end ?? null,
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params

  // check local scaffold first
  const found = GOVERNMENT_ENTITIES.find((e) => e.id === id)
  if (found) return NextResponse.json({ entity: found }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } })

  // if not found, try to resolve committee:CODE or member:BIOGUIDE
  const [kind, code] = id.split(':')

  if (!API_KEY) return NextResponse.json({ error: 'Missing CONGRESS_API_KEY' }, { status: 404 })

  if (kind === 'committee') {
    const res = await fetch(`${BASE}/committee/${encodeURIComponent(code)}?api_key=${API_KEY}`, { next: { revalidate: 3600 } })
    if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const data = await res.json()
    const entity = normalizeCommittee(data)
    return NextResponse.json({ entity }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } })
  }

  if (kind === 'member') {
    const res = await fetch(`${BASE}/member/${encodeURIComponent(code)}?api_key=${API_KEY}`, { next: { revalidate: 3600 } })
    if (!res.ok) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    const data = await res.json()
    const entity = normalizeMember(data)
    return NextResponse.json({ entity }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } })
  }

  return NextResponse.json({ error: 'Unsupported entity' }, { status: 400 })
}
