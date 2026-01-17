import { SearchResult } from '@/lib/search/search';
import { searchDataGov } from '@/lib/adapters/dataGov';
import { searchGovInfo } from '@/lib/adapters/govInfo';
import { searchCensus } from '@/lib/adapters/census';

export async function searchAll(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const trimmedQuery = query.trim();

  // Call all adapters in parallel
  const [dataGovResults, govInfoResults, censusResults] = await Promise.allSettled([
    searchDataGov(trimmedQuery),
    searchGovInfo(trimmedQuery),
    searchCensus(trimmedQuery)
  ]);

  // Collect successful results, log failures
  const allResults: SearchResult[] = [];

  if (dataGovResults.status === 'fulfilled') {
    allResults.push(...dataGovResults.value);
  } else {
    console.warn('Data.gov search failed:', dataGovResults.reason);
  }

  if (govInfoResults.status === 'fulfilled') {
    allResults.push(...govInfoResults.value);
  } else {
    console.warn('GovInfo search failed:', govInfoResults.reason);
  }

  if (censusResults.status === 'fulfilled') {
    allResults.push(...censusResults.value);
  } else {
    console.warn('Census search failed:', censusResults.reason);
  }

  // Apply ranking: sort by date (newer first), then by title relevance
  return rankResults(allResults, trimmedQuery);
}

function rankResults(results: SearchResult[], query: string): SearchResult[] {
  const queryLower = query.toLowerCase();

  return results.sort((a, b) => {
    // First, sort by date (newer first)
    if (a.date && b.date) {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA !== dateB) {
        return dateB - dateA; // Newer dates first
      }
    } else if (a.date && !b.date) {
      return -1; // Items with dates come first
    } else if (!a.date && b.date) {
      return 1; // Items with dates come first
    }

    // Then, sort by title relevance (basic includes match)
    const titleA = (a.title || '').toLowerCase();
    const titleB = (b.title || '').toLowerCase();

    const aStartsWithQuery = titleA.startsWith(queryLower);
    const bStartsWithQuery = titleB.startsWith(queryLower);

    if (aStartsWithQuery && !bStartsWithQuery) {
      return -1;
    } else if (!aStartsWithQuery && bStartsWithQuery) {
      return 1;
    }

    const aIncludesQuery = titleA.includes(queryLower);
    const bIncludesQuery = titleB.includes(queryLower);

    if (aIncludesQuery && !bIncludesQuery) {
      return -1;
    } else if (!aIncludesQuery && bIncludesQuery) {
      return 1;
    }

    // Finally, sort alphabetically by title
    return titleA.localeCompare(titleB);
  });
}
