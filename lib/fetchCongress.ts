import { GOVERNMENT_ENTITIES } from '@/lib/government/entities'
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

  return nodes
}
