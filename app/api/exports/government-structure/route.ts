import { NextResponse } from 'next/server'
import { GOVERNMENT_BRANCHES } from '@/lib/government/seed'
import { COMMITTEES } from '@/lib/government/committeeSeed'

type Node = {
  id: string
  name: string
  type: 'Root' | 'Branch' | 'Chamber' | 'Committee' | 'Subcommittee'
  parent_id?: string | null
  branch?: string | null
  chamber?: 'House' | 'Senate' | null
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = url.searchParams.get('format') || 'json'

  const nodes: Node[] = []

  // Root (use explicit id `us_gov` per schema)
  nodes.push({ id: 'us_gov', name: 'United States Government', type: 'Root', parent_id: null, branch: null, chamber: null })

  // Explicit canonical branches
  nodes.push({ id: 'leg', name: 'Legislative Branch', type: 'Branch', parent_id: 'us_gov', branch: null, chamber: null })
  nodes.push({ id: 'exec', name: 'Executive Branch', type: 'Branch', parent_id: 'us_gov', branch: null, chamber: null })
  nodes.push({ id: 'jud', name: 'Judicial Branch', type: 'Branch', parent_id: 'us_gov', branch: null, chamber: null })

  // Chambers under legislative
  nodes.push({ id: 'house', name: 'House of Representatives', type: 'Chamber', parent_id: 'leg', branch: null, chamber: 'House' })
  nodes.push({ id: 'senate', name: 'Senate', type: 'Chamber', parent_id: 'leg', branch: null, chamber: 'Senate' })

  // Committees: include existing seed committees and ensure a small canonical set
  const seen = new Set<string>()
  for (const c of COMMITTEES) {
    const parent = c.chamber === 'House' ? 'house' : c.chamber === 'Senate' ? 'senate' : 'house'
    nodes.push({ id: c.code, name: c.name, type: 'Committee', parent_id: parent, branch: null, chamber: (c.chamber as 'House' | 'Senate') })
    seen.add(c.code)
  }

  // Ensure a few canonical committees exist for Flourish examples if not present
  const canonical = [
    { code: 'HAGR', name: 'House Committee on Agriculture', chamber: 'House' },
    { code: 'HSJU', name: 'House Judiciary Committee', chamber: 'House' },
    { code: 'SSJU', name: 'Senate Judiciary Committee', chamber: 'Senate' },
  ]
  for (const c of canonical) {
    if (!seen.has(c.code)) {
      const parent = c.chamber === 'House' ? 'house' : 'senate'
      nodes.push({ id: c.code, name: c.name, type: 'Committee', parent_id: parent, branch: null, chamber: (c.chamber as 'House' | 'Senate') })
    }
  }

  if (format === 'csv') {
    // Exact Flourish header: id,name,type,parent_id,branch,chamber
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
    return new NextResponse(rows.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="government_structure.csv"', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
  }

  // JSON output with same keys
  return NextResponse.json({ nodes })
}
