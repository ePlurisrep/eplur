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

  // Normalize agency to a plain string when possible
  let agency: string | undefined = undefined
  if (typeof raw.agency === 'string') {
    agency = raw.agency
  } else if (raw.organization) {
    if (typeof raw.organization === 'string') agency = raw.organization
    else if (typeof raw.organization?.title === 'string') agency = raw.organization.title
    else if (typeof raw.organization?.name === 'string') agency = raw.organization.name
  }

  // Normalize summary/description to a plain string
  let summary: string | undefined = undefined
  if (typeof raw.summary === 'string') summary = raw.summary
  else if (typeof raw.description === 'string') summary = raw.description
  else if (typeof raw.notes === 'string') summary = raw.notes

  return {
    id,
    title,
    recordType: inferRecordKind(source),
    date,
    jurisdiction: raw.jurisdiction ?? raw.country ?? undefined,
    source: source,
    agency,
    url: raw.url ?? raw.link ?? raw.resourceUrl ?? '#',
    summary,
  }
}
