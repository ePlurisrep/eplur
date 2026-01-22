import type { PublicRecord } from '@/types/publicRecord'
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

  // Normalization: map fields from the raw record into our minimal contract
  const r: any = raw
  const normalized: NormalizedRecord = {
    id: String(r.id),
    title: String(r.title ?? 'Untitled'),
    agency: r.source ?? r.agency ?? undefined,
    jurisdiction: r.jurisdiction ?? undefined,
    recordType: r.recordType ?? undefined,
    summary: (r.description ?? r.summary ?? r.excerpt) ?? undefined,
    sourceUrl: r.originalUrl ?? r.sourceUrl ?? r.url ?? undefined,
    publishedAt: r.date ?? r.publishedAt ?? r.createdAt ?? undefined,
  }

  return normalized
}

export default getRecordById
