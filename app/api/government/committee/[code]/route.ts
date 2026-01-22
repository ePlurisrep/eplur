import { NextResponse } from 'next/server'
import { COMMITTEES, COMMITTEE_MEMBERSHIPS } from '@/lib/government/committeeSeed'

export async function GET(_req: Request, { params }: { params: { code: string } }) {
  const { code } = params
  const committee = COMMITTEES.find((c) => c.code === code)
  if (!committee) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const memberships = COMMITTEE_MEMBERSHIPS.filter((m) => m.committeeCode === code)
  return NextResponse.json({ committee, memberships })
}
