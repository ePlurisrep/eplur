import { PublicRecord } from '@/types/publicRecord'

// local helper signature uses the canonical PublicRecord type

/**
 * Minimal server-side record fetcher.
 * Replace this implementation with a real DB/Supabase call as needed.
 */
export async function getRecordById(id: string): Promise<PublicRecord | null> {
  // placeholder/mock data — keep simple and deterministic for now
  if (!id) return null

  return {
    id,
    title: `Record ${id} — Example Document`,
    url: `https://example.com/docs/${encodeURIComponent(id)}`,
    recordType: id.startsWith('ds') ? 'Dataset' : 'Document',
    jurisdiction: 'United States',
    source: 'Example Agency',
    originalUrl: `https://example.com/original/${encodeURIComponent(id)}`,
    date: new Date().toISOString().slice(0, 10),
    // provenance metadata (mocked for now)
    fetchedAt: new Date().toISOString(),
    contentType: id.endsWith('.pdf') ? 'application/pdf' : 'text/html',
  }
}

export default getRecordById

/**
 * Very small related-records heuristic for Phase 2.
 * Returns a few synthetic records that share jurisdiction or source.
 * Replace with a real DB/search-backed implementation later.
 */
export async function getRelatedRecords(id: string, limit = 6): Promise<PublicRecord[]> {
  // naive grouping: use id prefix (before first dash) to simulate relatedness
  const prefix = id.split('-')[0]
  const results: PublicRecord[] = []

  for (let i = 1; i <= limit; i++) {
    const rid = `${prefix}-${i}`
    if (rid === id) continue
    results.push({
      id: rid,
      title: `Related: Record ${rid}`,
      url: `https://example.com/docs/${encodeURIComponent(rid)}`,
      recordType: id.startsWith('ds') ? 'Dataset' : 'Document',
      jurisdiction: 'United States',
      source: 'Example Agency',
      originalUrl: `https://example.com/original/${encodeURIComponent(rid)}`,
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0, 10),
      fetchedAt: new Date(Date.now() - i * 60000).toISOString(),
      contentType: 'text/html',
    })
  }

  return results
}
