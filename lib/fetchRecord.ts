import { normalizeSearchResult } from './normalizeSearchResult'

export async function fetchRecord(id: string | undefined | null) {
  if (!id) return null

  const base = process.env.BASE_URL ?? ''
  const url = `${base}/api/proxy/record?id=${encodeURIComponent(String(id))}`

  try {
    const res = await fetch(url)
    if (!res.ok) return null
    const raw = await res.json()
    return normalizeSearchResult(raw, 0)
  } catch (e) {
    return null
  }
}

export default fetchRecord
