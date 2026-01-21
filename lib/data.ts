import type { PublicRecord } from './records'
import { getRecordById as fetchRecordById } from './records'

export type NormalizedRecord = {
  id: string
  title: string
  agency?: string
  jurisdiction?: string
  recordType?: string
  summary?: string
  sourceUrl?: string
  publishedAt?: string
}

export async function getRecordById(id: string): Promise<NormalizedRecord | null> {
  const raw = await fetchRecordById(id)
  if (!raw) return null

  // Normalization: map fields from the raw PublicRecord into our minimal contract
  const normalized: NormalizedRecord = {
    id: String(raw.id),
    title: String(raw.title ?? 'Untitled'),
    agency: raw.source ?? raw.agency ?? undefined,
    jurisdiction: raw.jurisdiction ?? undefined,
    recordType: raw.recordType ?? undefined,
    summary: (raw.description ?? raw.summary ?? raw.excerpt) ?? undefined,
    sourceUrl: raw.originalUrl ?? raw.sourceUrl ?? raw.url ?? undefined,
    publishedAt: raw.date ?? raw.publishedAt ?? raw.createdAt ?? undefined,
  }

  return normalized
}

export default getRecordById
