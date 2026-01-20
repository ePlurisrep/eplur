import { SearchResult } from '@/lib/search/search';

interface DataGovDataset {
  title: string;
  organization: {
    title: string;
  };
  metadata_modified: string;
  landingPage?: string;
  description?: string;
}

interface DataGovResponse {
  result: {
    results: DataGovDataset[];
  };
}

export async function searchDataGov(query: string): Promise<SearchResult[]> {
  const baseUrl = 'https://catalog.data.gov/api/3/action/package_search';
  const params = new URLSearchParams({
    q: query,
    rows: '20', // Limit results
    start: '0'
  });
  const cache = await import('./cache')
  const cacheKey = `datagov:search:${query}`
  const cached = await cache.getCached(cacheKey)
  if (cached) return cached
  const apiKey = process.env.DATAGOV_API_KEY || process.env.NEXT_PUBLIC_DATAGOV_API_KEY || null

  if (!apiKey) {
    console.info('No DATAGOV_API_KEY configured; using public Data.gov API endpoint')
  }

  const url = `${baseUrl}?${params}`
  const response = await fetchWithRetry(url, apiKey)
  if (!response || !response.ok) {
    console.warn(`Data.gov API error: ${response?.status ?? 'no-response'}`)
    return []
  }

  const data: DataGovResponse = await response.json()
  const results = data.result.results.map(normalizeDataGovResult)
  await cache.setCached(cacheKey, results, 60 * 60)
  return results
}

function normalizeDataGovResult(dataset: DataGovDataset): SearchResult {
  return {
    title: dataset.title,
    agency: dataset.organization?.title || 'Unknown Agency',
    date: dataset.metadata_modified || null,
    source: 'data.gov',
    url: dataset.landingPage || `https://catalog.data.gov/dataset/${dataset.title.replace(/\s+/g, '-').toLowerCase()}`,
    description: dataset.description || null
  };
}

async function fetchWithRetry(url: string, apiKey: string | null, retries = 2, timeoutMs = 10000): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), timeoutMs)
      const headers: Record<string, string> = {}
      if (apiKey) {
        headers['X-API-Key'] = apiKey
      }

      const res = await fetch(url, { headers, signal: controller.signal })
      clearTimeout(id)
      if (!res.ok && attempt < retries) {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
        continue
      }
      return res
    } catch (err) {
      if (attempt === retries) throw err
      await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
  // Should never reach here, but satisfy return type
  throw new Error('Failed to fetch after retries')
}
