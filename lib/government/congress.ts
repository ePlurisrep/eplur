// lib/government/congress.ts
// Server-side helper for Congress / legislative entity data.
// Currently returns static stubs. Replace the stubbed fetches
// with Congress.gov API calls when ready and set CONGRESS_API_KEY.

export type Member = {
  id?: string
  name: string
  party?: string
  state?: string
  role?: string
  startDate?: string
  endDate?: string
}

export type EntityOverview = {
  id?: string
  name: string
  jurisdiction?: string
  currentMembers?: Member[]
  historicalMembers?: Member[]
  linkedDatasets?: { type: string; query: string }[]
}

const STUB_HOUSE: EntityOverview = {
  id: 'house',
  name: 'U.S. House of Representatives',
  jurisdiction: 'United States',
  currentMembers: [
    { name: 'Representative Example', party: 'D', state: 'CA', role: 'Member' },
  ],
  linkedDatasets: [
    { type: 'bills', query: 'congress+house+bills' },
    { type: 'hearings', query: 'house+hearings' },
  ],
}

const STUB_SENATE: EntityOverview = {
  id: 'senate',
  name: 'U.S. Senate',
  jurisdiction: 'United States',
  currentMembers: [{ name: 'Senator Example', party: 'R', state: 'TX', role: 'Member' }],
  linkedDatasets: [
    { type: 'bills', query: 'congress+senate+bills' },
    { type: 'hearings', query: 'senate+hearings' },
  ],
}

export async function getHouseOverview(): Promise<EntityOverview> {
  // TODO: if process.env.CONGRESS_API_KEY present, fetch real data here.
  return STUB_HOUSE
}

export async function getSenateOverview(): Promise<EntityOverview> {
  // TODO: replace with API call
  return STUB_SENATE
}

export async function getCommitteeById(id: string): Promise<EntityOverview | null> {
  // Simple stub mapping; replace with a lookup against Congress.gov API
  if (id === 'intelligence') {
    return {
      id: 'intelligence',
      name: 'House Intelligence Committee',
      jurisdiction: 'United States',
      currentMembers: [
        { name: 'Rep. Jane Doe', party: 'D', state: 'NY', role: 'Chair' },
        { name: 'Rep. John Smith', party: 'R', state: 'TX', role: 'Ranking Member' },
      ],
      historicalMembers: [
        { name: 'Rep. Old Member', party: 'R', state: 'OH', startDate: '1998-01-03', endDate: '2006-01-03' },
      ],
      linkedDatasets: [
        { type: 'hearings', query: 'intelligence+committee+hearings' },
        { type: 'reports', query: 'intelligence+committee+reports' },
      ],
    }
  }

  // default placeholder
  return {
    id,
    name: `Committee ${id}`,
    jurisdiction: 'United States',
    currentMembers: [],
    linkedDatasets: [],
  }
}

export default null
