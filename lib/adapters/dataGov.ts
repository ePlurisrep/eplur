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

  const response = await fetch(`${baseUrl}?${params}`);
  if (!response.ok) {
    throw new Error(`Data.gov API error: ${response.status}`);
  }

  const data: DataGovResponse = await response.json();
  return data.result.results.map(normalizeDataGovResult);
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
