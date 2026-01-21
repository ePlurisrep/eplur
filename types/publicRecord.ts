export type PublicRecord = {
  id: string
  title: string
  recordType: string
  jurisdiction?: string
  date?: string
  source: string
  agency?: string
  url: string
  originalUrl?: string
  // Optional provenance / fetch metadata
  fetchedAt?: string
  contentType?: string
  // Optional user tagging when surfaced from the Vault
  tags?: string[]
}
