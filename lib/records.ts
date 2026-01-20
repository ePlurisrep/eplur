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
  }
}

export default getRecordById
