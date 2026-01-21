import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  // TEMP: reuse documents endpoint used elsewhere in the app
  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  const url = base
    ? `${base}/api/documents?id=${encodeURIComponent(id)}`
    : `https://example.com/api/documents?id=${encodeURIComponent(id)}`

  const res = await fetch(url)

  if (!res.ok) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 })
  }

  const data = await res.json()
  return NextResponse.json(data)
}
