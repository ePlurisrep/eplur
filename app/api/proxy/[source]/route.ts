import { NextRequest, NextResponse } from 'next/server'
import { searchGovInfo } from '../../../../lib/adapters/govInfo'
import { searchDataGov } from '../../../../lib/adapters/dataGov'
import { searchCensus } from '../../../../lib/adapters/census'

export async function GET(request: NextRequest, { params }: { params: { source: string } }) {
  const source = params.source?.toLowerCase()
  const url = new URL(request.url)
  const q = url.searchParams.get('q') || url.searchParams.get('query') || ''

  if (!q) return NextResponse.json({ error: 'query param required' }, { status: 400 })

  try {
    switch (source) {
      case 'govinfo':
      case 'gov':
      case 'fr':
        return NextResponse.json(await searchGovInfo(q))
      case 'datagov':
      case 'data':
      case 'data.gov':
        return NextResponse.json(await searchDataGov(q))
      case 'census':
        return NextResponse.json(await searchCensus(q))
      default:
        return NextResponse.json({ error: 'unknown source' }, { status: 400 })
    }
  } catch (err) {
    console.error('Proxy error:', err)
    return NextResponse.json({ error: 'proxy error' }, { status: 500 })
  }
}
