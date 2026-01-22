import { NextResponse } from 'next/server'
import { COMMITTEES, COMMITTEE_MEMBERSHIPS } from '@/lib/government/committeeSeed'

// This export intentionally avoids any external API calls so the output is
// an immutable snapshot derived from local seed data only.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = url.searchParams.get('format') || 'json'

  const committeeMap = new Map(COMMITTEES.map((c) => [c.code, c]))

  // Build rows directly from seed data. `name` left blank because this
  // endpoint must not perform live enrichment; names can be merged into
  // the dataset in a separate offline job if desired.
  const rows = COMMITTEE_MEMBERSHIPS.map((m) => {
    const committee = committeeMap.get(m.committeeCode)
    return {
      bioguideId: m.bioguideId,
      name: null,
      committeeCode: m.committeeCode,
      committeeName: committee?.name || null,
      role: m.role,
      congress: m.congress,
      chamber: committee?.chamber || null,
    }
  })

  if (format === 'csv') {
    const header = ['bioguideId', 'name', 'committeeCode', 'committeeName', 'role', 'congress', 'chamber']
    const lines = [header.join(',')]
    for (const r of rows) {
      lines.push([
        r.bioguideId,
        `"${String(r.name ?? '').replace(/"/g, '""')}"`,
        r.committeeCode,
        `"${String(r.committeeName ?? '').replace(/"/g, '""')}"`,
        r.role,
        String(r.congress),
        r.chamber ?? '',
      ].join(','))
    }
    return new NextResponse(lines.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="committee-memberships.csv"' } })
  }

  return NextResponse.json({ memberships: rows })
}
