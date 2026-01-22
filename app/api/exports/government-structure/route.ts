import { NextResponse } from 'next/server'
import { fetchCongressData } from '@/lib/fetchCongress'
import { toFlourish, toFlourishCSV } from '@/lib/exports/toFlourish'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = url.searchParams.get('format') || 'json'

  const nodes = await fetchCongressData()

  if (format === 'csv') {
    const csv = toFlourishCSV(nodes)
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="government_structure.csv"', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
  }

  // JSON format as Flourish-friendly objects
  return NextResponse.json({ nodes: toFlourish(nodes) }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
}
