import { NextResponse } from 'next/server'
import { fetchCongressRelations } from '@/lib/fetchCongress'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = (url.searchParams.get('format') || 'json').toLowerCase()

  const relations = await fetchCongressRelations()

  if (format === 'csv') {
    const header = ['fromId', 'toId', 'type', 'startDate', 'endDate']
    const lines = [header.join(',')]
    for (const r of relations) {
      lines.push([
        r.fromId,
        r.toId,
        r.type,
        r.startDate ?? '',
        r.endDate ?? '',
      ].join(','))
    }
    return new NextResponse(lines.join('\n'), { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="relations.csv"' } })
  }

  return NextResponse.json({ relations })
}
