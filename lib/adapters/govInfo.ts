import { SearchResult } from '@/lib/search/search';

interface GovInfoPackage {
  packageId: string;
  title: string;
  category?: string;
  lastModified?: string;
  detailsLink?: string;
  description?: string;
  collectionCode?: string;
  collectionName?: string;
  branch?: string;
  governmentAuthor?: string;
  dateIssued?: string;
  granuleClass?: string;
}

interface GovInfoSearchResponse {
  packages: GovInfoPackage[];
  count?: number;
  message?: string;
}

interface GovInfoCollectionResponse {
  collectionCode: string;
  collectionName: string;
  packageCount: number;
  granuleCount: number;
}

// GovInfo API requires an API key - get one at https://www.govinfo.gov/developers
const GOVINFO_API_KEY = process.env.GOVINFO_API || '';
const GOVINFO_BASE_URL = 'https://api.govinfo.gov';

// Collections to search across
const COLLECTIONS = ['BILLS', 'REPORT', 'CFR'];

export async function searchGovInfo(query: string): Promise<SearchResult[]> {
  if (!GOVINFO_API_KEY) {
    console.warn('GovInfo API key not found. Set GOVINFO_API_KEY environment variable.');
    return [];
  }

  const allResults: SearchResult[] = [];

  // Search across all collections in parallel
  const searchPromises = COLLECTIONS.map(collection =>
    searchCollection(collection, query)
  );

  try {
    const results = await Promise.allSettled(searchPromises);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        allResults.push(...result.value);
      } else {
        console.warn('Collection search failed:', result.reason);
      }
    });
  } catch (error) {
    console.warn('GovInfo search failed:', error);
  }

  return allResults.slice(0, 20); // Limit to 20 results total
}

async function searchCollection(collection: string, query: string): Promise<SearchResult[]> {
  const url = `${GOVINFO_BASE_URL}/collections/${collection}/search`;
  const params = new URLSearchParams({
    query: query,
    pageSize: '10', // Limit per collection
    offset: '0',
    api_key: GOVINFO_API_KEY
  });

  try {
    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      throw new Error(`GovInfo API error for ${collection}: ${response.status}`);
    }

    const data: GovInfoSearchResponse = await response.json();

    if (!data.packages) {
      return [];
    }

    return data.packages.map(pkg => normalizeGovInfoResult(pkg, collection));
  } catch (error) {
    console.warn(`GovInfo ${collection} search failed:`, error);
    return [];
  }
}

function normalizeGovInfoResult(pkg: GovInfoPackage, collection: string): SearchResult {
  // Handle messy metadata gracefully
  const title = pkg.title || pkg.packageId || 'Untitled Document';

  // Determine agency based on available fields
  let agency = 'Government Publishing Office';
  if (pkg.governmentAuthor) {
    agency = pkg.governmentAuthor;
  } else if (pkg.branch) {
    agency = `${pkg.branch} Branch`;
  } else if (pkg.collectionName) {
    agency = pkg.collectionName;
  }

  // Use dateIssued if available, otherwise lastModified
  const date = pkg.dateIssued || pkg.lastModified || null;

  // Construct URL - prefer detailsLink, fallback to constructed URL
  let url = pkg.detailsLink;
  if (!url && pkg.packageId) {
    url = `https://www.govinfo.gov/content/pkg/${pkg.packageId}`;
  }
  if (!url) {
    url = `https://www.govinfo.gov/collections/${collection}`;
  }

  // Build description from available fields
  let description = pkg.description || '';
  if (pkg.granuleClass && !description.includes(pkg.granuleClass)) {
    description = description ? `${description} (${pkg.granuleClass})` : pkg.granuleClass;
  }
  if (pkg.category && !description.includes(pkg.category)) {
    description = description ? `${description} - ${pkg.category}` : pkg.category;
  }

  return {
    title,
    agency,
    date,
    source: 'govinfo',
    url,
    description: description || undefined
  };
}