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
const GOVINFO_API_KEY = process.env.GOVINFO_API_KEY || '';
const GOVINFO_BASE_URL = 'https://api.govinfo.gov';

// Collection to search
const COLLECTION = 'FR';

export async function searchGovInfo(query: string): Promise<SearchResult[]> {
  if (!GOVINFO_API_KEY) {
    console.warn('GovInfo API key not found. Set GOVINFO_API_KEY environment variable.');
    return [];
  }

  return await searchCollection(COLLECTION, query);
}

async function searchCollection(collection: string, query: string): Promise<SearchResult[]> {
  const url = `${GOVINFO_BASE_URL}/collections/${collection}/search`;
  const params = new URLSearchParams({
    api_key: GOVINFO_API_KEY,
    query: query,
    pageSize: '10',
    offsetMark: '*'
  });

  try {
    const response = await fetch(`${url}?${params}`);
    if (!response.ok) {
      console.warn(`GovInfo ${collection} failed`, await response.text());
      return [];
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
    description: description || null
  };
}