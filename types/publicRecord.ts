import type { RecordLink } from './governmentGraph'

export interface PublicRecord {
  id: string
  title: string
  recordType?: string
  jurisdiction?: string
  agency?: string
  source?: string
  url?: string
  date?: string
  summary?: string

  // optional governance links tying this record to GovernmentNode ids
  links?: RecordLink[]
}
