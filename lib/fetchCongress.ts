import { GOVERNMENT_ENTITIES } from '@/lib/government/entities'
import executiveNodes from '@/lib/executiveSeed'
import supremeCourtNodes from '@/lib/judicialSeed'
import type { GovernmentRelation } from '@/types/government'
import type { GovernmentNode } from '@/types/government'

const BASE_URL = 'https://api.congress.gov/v3'
const API_KEY = process.env.CONGRESS_API_KEY

async function congressFetch(endpoint: string) {
  const url = `${BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}api_key=${API_KEY}&limit=250`
  const res = await fetch(url, { next: { revalidate: 86400 } })
  if (!res.ok) throw new Error(`Congress API error: ${res.status}`)
  return res.json()
}

export async function fetchCongressData(): Promise<GovernmentNode[]> {
  // If no API key, return local scaffold
  if (!API_KEY) return GOVERNMENT_ENTITIES

  const nodes: GovernmentNode[] = []

  // --- BRANCH ---
  nodes.push({
    id: 'branch-legislative',
    type: 'branch',
    name: 'Legislative Branch',
    branch: 'legislative',
    metadata: {},
    sources: {},
  })

  // --- BODIES ---
  const chambers = [
    { id: 'body-house', name: 'House of Representatives', chamber: 'House' },
    { id: 'body-senate', name: 'U.S. Senate', chamber: 'Senate' },
  ]

  for (const c of chambers) {
    nodes.push({
      id: c.id,
      type: 'body',
      name: c.name,
      parentId: 'branch-legislative',
      branch: 'legislative',
      metadata: { chamber: c.chamber as 'House' | 'Senate' },
      sources: {},
    })
  }

  // --- MEMBERS ---
  try {
    const memberData = await congressFetch('/member')
    for (const m of memberData.members ?? []) {
      nodes.push({
        id: `member-${m.bioguideId || m.id}`,
        type: 'member',
        name: m.name || `${m.first_name || ''} ${m.last_name || ''}`.trim(),
        parentId: m.chamber === 'House' ? 'body-house' : 'body-senate',
        branch: 'legislative',
        startDate: m.startYear ? String(m.startYear) : undefined,
        metadata: {
          state: m.state ?? null,
          party: m.party ?? null,
          district: m.district ?? null,
          chamber: (m.chamber as 'House' | 'Senate') ?? null,
        },
        sources: {
          congressGovId: m.bioguideId ?? m.id ?? undefined,
          url: m.url ?? undefined,
        },
      })
    }
  } catch (e) {
    // If Congress.gov fetch fails, fall back to local scaffold
    console.warn('fetchCongressData: congress fetch failed, falling back to scaffold', e)
    return GOVERNMENT_ENTITIES
  }

  // append curated seeds (executive + judicial) ensuring no duplicates
  const seen = new Set(nodes.map((n) => n.id))
  for (const s of executiveNodes) {
    if (!seen.has(s.id)) {
      nodes.push(s)
      seen.add(s.id)
    }
  }
  for (const j of supremeCourtNodes) {
    if (!seen.has(j.id)) {
      nodes.push(j)
      seen.add(j.id)
    }
  }

  return nodes
}

export async function fetchCongressRelations(): Promise<GovernmentRelation[]> {
  // derive simple relations from bills (sponsors, referrals)
  if (!API_KEY) return []

  const relations: GovernmentRelation[] = []

  try {
    const url = `${BASE_URL}/bill?api_key=${API_KEY}&limit=250`
    const res = await fetch(url, { next: { revalidate: 86400 } })
    if (!res.ok) throw new Error(`Congress API error: ${res.status}`)
    const data = await res.json()

    for (const b of data.bills ?? []) {
      const billId = `bill-${b.number}-${b.congress}`

      // sponsors
      for (const s of (b.sponsors || [])) {
        const memberId = s.bioguideId ? `member-${s.bioguideId}` : s.id ? `member-${s.id}` : null
        if (memberId) {
          relations.push({ fromId: billId, toId: memberId, type: 'sponsored_by' })
        }
      }

      // referrals -> committees
      for (const c of (b.committees || [])) {
        if (c.systemCode) {
          relations.push({ fromId: billId, toId: `committee-${c.systemCode}`, type: 'referred_to' })
        }
      }
    }
  } catch (e) {
    console.warn('fetchCongressRelations: failed to fetch bill relations', e)
  }

  return relations
}
