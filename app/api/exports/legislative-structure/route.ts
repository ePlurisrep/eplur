import { NextResponse } from 'next/server'
import { GOVERNMENT_BRANCHES } from '@/lib/government/seed'
import { COMMITTEES } from '@/lib/government/committeeSeed'

// Variant focused on the Legislative branch only (conforms to Dataset A shape)
export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = url.searchParams.get('format') || 'json'

  const nodes: any[] = []

  // Only include the legislative branch
  const legislative = GOVERNMENT_BRANCHES.find((b) => b.id === 'branch-legislative')
  if (!legislative) return NextResponse.json({ nodes: [] })

  nodes.push({ id: legislative.id, name: legislative.name, type: 'Branch', parent_id: null })

  const houseId = 'chamber-house'
  const senateId = 'chamber-senate'

  nodes.push({ id: houseId, name: 'House of Representatives', type: 'Chamber', parent_id: legislative.id, chamber: 'House' })
  nodes.push({ id: senateId, name: 'Senate', type: 'Chamber', parent_id: legislative.id, chamber: 'Senate' })

  for (const c of COMMITTEES) {
    const parent = c.chamber === 'House' ? houseId : c.chamber === 'Senate' ? senateId : legislative.id
    nodes.push({ id: `committee-${c.code}`, name: c.name, type: 'Committee', parent_id: parent, chamber: (c.chamber as 'House' | 'Senate') })
  }

  if (format === 'csv') {
    const header = ['id', 'name', 'type', 'parent_id', 'branch', 'chamber']
    const rows = [header.join(',')]
    for (const n of nodes) {
      rows.push([
        n.id,
        `"${String(n.name).replace(/"/g, '""')}"`,
        n.type,
        n.parent_id ?? '',
        n.branch ?? '',
        n.chamber ?? '',
      ].join(','))
    }
    return new NextResponse(rows.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="government_structure.csv"' } })
  }

  return NextResponse.json({ nodes })
}
