import { NextResponse } from 'next/server'
import { fetchCongressData } from '@/lib/fetchCongress'
import { filterByYear } from '@/lib/timeFilter'
import { toFlourishSnake, toFlourishSnakeCSV } from '@/lib/exports/toFlourish'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const yearParam = url.searchParams.get('year')
  const format = (url.searchParams.get('format') || 'json').toLowerCase()

  let nodes = await fetchCongressData()

  if (yearParam) {
    const year = Number(yearParam)
    if (!Number.isNaN(year)) {
      nodes = filterByYear(nodes, year)
    }
  }

  if (format === 'csv') {
    const csv = toFlourishSnakeCSV(nodes)
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="government_structure.csv"',
        'Cache-Control': 'public, s-maxage=3600',
      },
    })
  }

  return NextResponse.json({ nodes: toFlourishSnake(nodes) }, { headers: { 'Cache-Control': 'public, s-maxage=3600' } })
}
