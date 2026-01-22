import type { GovernmentNode } from '@/types/government'

export async function fetchBills(): Promise<GovernmentNode[]> {
  const res = await fetch(
    `https://api.congress.gov/v3/bill?api_key=${process.env.CONGRESS_API_KEY}&limit=100`
  )

  const data = await res.json()
  const nodes: GovernmentNode[] = []

  for (const b of data.bills ?? []) {
    nodes.push({
      id: `bill-${b.number}-${b.congress}`,
      type: 'bill',
      name: `${String(b.type).toUpperCase()} ${b.number}`,
      parentId: b.committees?.[0]?.systemCode ? `committee-${b.committees[0].systemCode}` : undefined,
      branch: 'legislative',
      startDate: b.introducedDate,
      metadata: {
        title: b.title,
        congress: b.congress,
      },
      sources: {
        url: b.url,
      },
    })
  }

  return nodes
}

export default fetchBills
