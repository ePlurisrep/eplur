import { NextRequest } from 'next/server'
import updateSession from '../../../../lib/supabase/proxy'

export async function GET(request: NextRequest) {
  // Server-side proxy endpoint to run session syncing logic.
  return updateSession(request)
}

export async function POST(request: NextRequest) {
  return updateSession(request)
}
