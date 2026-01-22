import { NextResponse } from 'next/server'
import { COMMITTEES } from '@/lib/government/committeeSeed'

export async function GET() {
  return NextResponse.json({ committees: COMMITTEES })
}
