import { NextResponse } from 'next/server'
import type { GovernmentNode } from '@/types/government'
import { GOVERNMENT_ENTITIES } from '@/lib/government/entities'

const API_KEY = process.env.CONGRESS_API_KEY
const BASE = 'https://api.congress.gov/v3'

function committeeToEntity(c: any): GovernmentNode {
  return {
    id: `committee:${c.code || c.committeeCode || c.id}`,
    type: 'committee',
    name: c.name || '',
    parentId: c.chamber ? `body:${c.chamber.toLowerCase()}` : null,
    metadata: { committeeType: c.committeeType || null, jurisdiction: c.jurisdiction ?? null },
    sources: { congressGovId: c.code || c.committeeCode || String(c.id) },
  }
}

function memberToEntity(m: any): GovernmentNode {
  const latestTerm = (m.terms || [])[0]
  return {
    id: `member:${m.bioguideId || m.id}`,
    type: 'member',
    name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim() || '',
    parentId: m.chamber ? `body:${m.chamber.toLowerCase()}` : null,
    metadata: { state: m.state || null, party: m.partyName || m.party || null },
    sources: { congressGovId: m.bioguideId || String(m.id) },
    startDate: latestTerm?.start || undefined,
    endDate: latestTerm?.end ?? null,
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url)
  const branch = url.searchParams.get('branch') || ''

  // Start with local scaffold
  const entities: GovernmentNode[] = [...GOVERNMENT_ENTITIES]

  // Only fetch Congress.gov data when requested for legislative branch
  if (branch === 'legislative' || branch === '') {
    if (!API_KEY) {
      // return scaffold only
      return NextResponse.json({ entities }, { headers: { 'Cache-Control': 'public, s-maxage=86400' } })
    }

    // fetch committees
    const cRes = await fetch(`${BASE}/committee?limit=250&api_key=${API_KEY}`, { next: { revalidate: 3600 } })
    if (cRes.ok) {
      const cData = await cRes.json()
      const comms = (cData.committees || []).map(committeeToEntity)
      entities.push(...comms)
    }

    // fetch members (limited list)
    const mRes = await fetch(`${BASE}/member?limit=250&api_key=${API_KEY}`, { next: { revalidate: 3600 } })
    if (mRes.ok) {
      const mData = await mRes.json()
      const mems = (mData.members || []).map(memberToEntity)
      entities.push(...mems)
    }
  }

  return NextResponse.json({ entities }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
}
