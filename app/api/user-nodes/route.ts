import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const body = await req.json()

  // TODO: persist with database (Prisma) and authentication
  return NextResponse.json({
    ...body,
    id: `user-${crypto.randomUUID()}`,
    type: 'userNode',
  })
}

export const runtime = 'edge'
