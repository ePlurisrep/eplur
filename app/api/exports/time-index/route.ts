import { NextResponse } from 'next/server'
import { COMMITTEE_MEMBERSHIPS } from '@/lib/government/committeeSeed'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = url.searchParams.get('format') || 'json'

  const congresses = Array.from(new Set(COMMITTEE_MEMBERSHIPS.map((m) => m.congress))).sort((a, b) => b - a)

  const rows = congresses.map((c) => {
    const start_year = 1789 + (c - 1) * 2
    const end_year = start_year + 1
    return { congress: c, start_year, end_year }
  })

  if (format === 'csv') {
    const header = ['congress', 'startYear', 'endYear']
    const lines = [header.join(',')]
    for (const r of rows) {
      lines.push([String(r.congress), String(r.start_year), String(r.end_year)].join(','))
    }
    return new NextResponse(lines.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="congress_timeline.csv"', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
  }

  return NextResponse.json({ congress_timeline: rows })
}
