import { NextResponse } from 'next/server'
import { COMMITTEES, COMMITTEE_MEMBERSHIPS } from '@/lib/government/committeeSeed'

export async function GET(_req: Request, { params }: { params: { bioguideId: string } }) {
  const { bioguideId } = params
  const memberships = COMMITTEE_MEMBERSHIPS.filter((m) => m.bioguideId === bioguideId)
  const enriched = memberships.map((m) => ({ ...m, committee: COMMITTEES.find((c) => c.code === m.committeeCode) }))
  return NextResponse.json({ memberships: enriched })
}
