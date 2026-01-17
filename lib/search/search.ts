export type SearchResult = {
  title: string
  agency: string
  date: string | null
  source: 'data.gov' | 'govinfo' | 'census'
  url: string
  description?: string
}
