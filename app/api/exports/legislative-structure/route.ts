import { NextResponse } from 'next/server'
import { fetchCongressData } from '@/lib/fetchCongress'
import { toFlourish, toFlourishCSV } from '@/lib/exports/toFlourish'

// Variant focused on the Legislative branch only (conforms to Dataset A shape)
export async function GET(req: Request) {
  const url = new URL(req.url)
  const format = url.searchParams.get('format') || 'json'

  const nodes = (await fetchCongressData()).filter((n) => n.branch === 'legislative' || n.type === 'root')

  if (format === 'csv') {
    const csv = toFlourishCSV(nodes)
    return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="legislative_structure.csv"', 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
  }

  return NextResponse.json({ nodes: toFlourish(nodes) }, { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } })
}
