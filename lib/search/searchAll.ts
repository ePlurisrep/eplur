import { searchDataGov } from '@/lib/adapters/dataGov'

export async function searchAll(query: string, opts?: { cookies?: string | null; baseUrl?: string | null }) {
  // `opts` is accepted for future proxying needs (cookies, baseUrl),
  // adapters currently use their own endpoints.
  const dataGovResults = await searchDataGov(query)

  return {
    query,
    results: dataGovResults.map((r: any) => ({
      id: r.id,
      title: r.title,
      agency: r.organization?.title ?? 'Unknown agency',
      date: r.metadata_modified,
      source: 'data.gov',
      url: r.url,
      description: r.notes,
    })),
  }
}
