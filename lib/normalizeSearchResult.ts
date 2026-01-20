import { inferRecordKind } from './recordKind'
import { PublicRecord } from '@/types/publicRecord'

export function normalizeSearchResult(raw: any, index: number): PublicRecord {
  const source = raw.source ?? raw.provider ?? 'unknown'
  const id = String(raw.id ?? raw.identifier ?? `${source}-${index}`)
  const title = raw.title ?? raw.name ?? 'Untitled'

  // Normalize date: prefer single date or range
  const dstart = raw.date || raw.date_start || raw.metadata_modified || undefined
  const dend = raw.date_end || undefined
  const date = dstart && dend ? `${dstart} — ${dend}` : dstart ?? undefined

  return {
    id,
    title,
    recordType: inferRecordKind(source),
    date,
    jurisdiction: raw.jurisdiction ?? raw.country ?? undefined,
    source: source,
    agency: raw.agency ?? raw.organization ?? undefined,
    url: raw.url ?? raw.link ?? raw.resourceUrl ?? '#',
  }
}
