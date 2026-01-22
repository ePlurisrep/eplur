import { NextResponse } from 'next/server'
import { COMMITTEES, COMMITTEE_MEMBERSHIPS } from '@/lib/government/committeeSeed'

// Alias endpoint matching example name; immutable snapshot from seeds only.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = url.searchParams.get('format') || 'json'
  const congressParam = url.searchParams.get('congress')
  const congressFilter = congressParam ? parseInt(congressParam, 10) : null

  const committeeMap = new Map(COMMITTEES.map((c) => [c.code, c]))

  const filtered = congressFilter ? COMMITTEE_MEMBERSHIPS.filter((m) => m.congress === congressFilter) : COMMITTEE_MEMBERSHIPS

  const rows = filtered.map((m) => {
    const committee = committeeMap.get(m.committeeCode)
    return {
      bioguideId: m.bioguideId,
      name: null,
      committeeCode: m.committeeCode,
      committeeName: committee?.name || null,
      role: m.role,
      congress: m.congress,
      chamber: committee?.chamber || null,
      party: null,
    }
  })

  if (format === 'csv') {
    // Exact requested header: bioguideId,name,committeeCode,committeeName,role,congress,chamber,party
    const header = ['bioguideId', 'name', 'committeeCode', 'committeeName', 'role', 'congress', 'chamber', 'party']
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
        r.party ?? '',
      ].join(','))
    }
    return new NextResponse(lines.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="committee_memberships.csv"', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
  }

  // JSON shape
  return NextResponse.json({ memberships: rows })
}
