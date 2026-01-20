import { inferRecordKind } from './recordKind'
import { PublicRecord } from '@/types/publicRecord'

export function normalizeSearchResult(raw: any, index: number): PublicRecord {
  const source = raw.source ?? raw.provider ?? 'unknown'
  const id = String(raw.id ?? raw.identifier ?? `${source}-${index}`)
  const title = raw.title ?? raw.name ?? 'Untitled'

  return {
    id,
    title,
    recordKind: inferRecordKind(source),
    dateStart: raw.date || raw.date_start || undefined,
    dateEnd: raw.date_end || undefined,
    jurisdiction: raw.jurisdiction ?? raw.country ?? undefined,
    source: source,
    agency: raw.agency ?? raw.organization ?? undefined,
    url: raw.url ?? raw.link ?? raw.resourceUrl ?? '#',
  }
}
