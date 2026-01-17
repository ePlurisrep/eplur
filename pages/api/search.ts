import type { NextApiRequest, NextApiResponse } from 'next'
import { searchDataGov } from '../../../lib/adapters/dataGov'
import { searchGovInfo } from '../../../lib/adapters/govInfo'
import { searchCensus } from '../../../lib/adapters/census'
import { SearchResult } from '../../../lib/search/search'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SearchResult[] | { error: string }>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { q } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' })
  }

  try {
    // Search all sources in parallel
    const [dataGovResults, govInfoResults, censusResults] = await Promise.allSettled([
      searchDataGov(q),
      searchGovInfo(q),
      searchCensus(q)
    ])

    const allResults: SearchResult[] = []

    // Collect successful results
    if (dataGovResults.status === 'fulfilled') {
      allResults.push(...dataGovResults.value)
    } else {
      console.warn('Data.gov search failed:', dataGovResults.reason)
    }

    if (govInfoResults.status === 'fulfilled') {
      allResults.push(...govInfoResults.value)
    } else {
      console.warn('GovInfo search failed:', govInfoResults.reason)
    }

    if (censusResults.status === 'fulfilled') {
      allResults.push(...censusResults.value)
    } else {
      console.warn('Census search failed:', censusResults.reason)
    }

    // Sort by date (most recent first) and limit to top 50 results
    const sortedResults = allResults
      .filter(result => result.date)
      .sort((a, b) => new Date(b.date!).getTime() - new Date(a.date!).getTime())
      .slice(0, 50)

    res.status(200).json(sortedResults)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Failed to fetch search results' })
  }
}