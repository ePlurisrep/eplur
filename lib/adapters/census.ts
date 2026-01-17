import { SearchResult } from '@/lib/search/search';

interface CensusDataset {
  dataset: string[];
  title: string;
  description: string;
  modified: string;
  publisher: {
    name?: string;
    '@type'?: string;
  };
  distribution?: Array<{
    downloadURL?: string;
    accessURL?: string;
    title?: string;
  }>;
  keyword?: string[];
  theme?: string[];
  contactPoint?: {
    fn?: string;
  };
  temporal?: string;
  spatial?: string;
  '@type'?: string;
  identifier?: string;
  license?: string;
  accrualPeriodicity?: string;
}

interface CensusResponse {
  dataset: CensusDataset[];
  '@context'?: any;
  '@id'?: string;
  '@type'?: string;
}

export async function searchCensus(query: string): Promise<SearchResult[]> {
  // Use the simplest endpoint - the dataset metadata catalog
  const baseUrl = 'https://api.census.gov/data.json';

  try {
    const response = await fetch(baseUrl);
    if (!response.ok) {
      throw new Error(`Census API error: ${response.status}`);
    }

    const data: CensusResponse = await response.json();

    // Filter datasets based on query (simple text matching)
    const filteredDatasets = data.dataset.filter(dataset =>
      matchesQuery(dataset, query)
    );

    return filteredDatasets.slice(0, 20).map(normalizeCensusResult);
  } catch (error) {
    console.warn('Census search failed:', error);
    return []; // Return empty array instead of throwing
  }
}

function matchesQuery(dataset: CensusDataset, query: string): boolean {
  const searchText = query.toLowerCase();
  const title = (dataset.title || '').toLowerCase();
  const description = (dataset.description || '').toLowerCase();
  const keywords = (dataset.keyword || []).join(' ').toLowerCase();

  return title.includes(searchText) ||
         description.includes(searchText) ||
         keywords.includes(searchText);
}

function normalizeCensusResult(dataset: CensusDataset): SearchResult {
  // Aggressive normalization for inconsistent titles
  let title = dataset.title || dataset.dataset?.[0] || 'Untitled Dataset';

  // Clean up common title issues
  title = title
    .replace(/\s+/g, ' ')  // Multiple spaces to single
    .replace(/^\s+|\s+$/g, '')  // Trim whitespace
    .replace(/[^\w\s\-.,()]/g, '')  // Remove special chars except common ones
    .substring(0, 200);  // Limit length

  // If title is still generic or empty, try to create a better one
  if (!title || title.length < 5 || title.toLowerCase().includes('untitled')) {
    const keywords = dataset.keyword?.slice(0, 3).join(', ');
    if (keywords) {
      title = `Census Data: ${keywords}`;
    } else {
      title = 'Census Dataset';
    }
  }

  // Agency normalization
  let agency = 'U.S. Census Bureau';
  if (dataset.publisher?.name) {
    agency = dataset.publisher.name;
  } else if (dataset.contactPoint?.fn) {
    agency = dataset.contactPoint.fn;
  }

  // Date normalization - Census uses various date formats
  let date = dataset.modified || null;
  if (date && date.includes('T')) {
    date = date.split('T')[0]; // Remove time component
  }

  // URL construction - prefer distribution links
  let url = '';
  if (dataset.distribution && dataset.distribution.length > 0) {
    const dist = dataset.distribution[0];
    url = dist.accessURL || dist.downloadURL || '';
  }

  // Fallback URL construction
  if (!url && dataset.identifier) {
    url = `https://www.census.gov/data/datasets/${dataset.identifier}.html`;
  } else if (!url && dataset.dataset && dataset.dataset.length > 0) {
    url = `https://www.census.gov/data/datasets/${dataset.dataset[0]}.html`;
  } else if (!url) {
    url = 'https://www.census.gov/data';
  }

  // Description normalization
  let description = dataset.description || '';

  // Add context from keywords/themes if description is short
  if (description.length < 50) {
    const keywords = dataset.keyword?.slice(0, 5).join(', ');
    if (keywords) {
      description = description ? `${description} (Keywords: ${keywords})` : `Keywords: ${keywords}`;
    }
  }

  // Add temporal/spatial info if available
  if (dataset.temporal && !description.includes(dataset.temporal)) {
    description = description ? `${description} [Time period: ${dataset.temporal}]` : `Time period: ${dataset.temporal}`;
  }

  return {
    title,
    agency,
    date,
    source: 'census',
    url,
    description: description || undefined
  };
}