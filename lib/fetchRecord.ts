import { normalizeSearchResult } from './normalizeSearchResult'

export async function fetchRecord(id: string) {
  const base = process.env.BASE_URL ?? ''
  const url = `${base}/api/proxy/record?id=${encodeURIComponent(id)}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch record ${id}`)
  const raw = await res.json()
  return normalizeSearchResult(raw, 0)
}

export default fetchRecord
