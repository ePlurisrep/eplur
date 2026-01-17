import type { NextApiRequest, NextApiResponse } from 'next'
import { searchAll } from '@/lib/search/searchAll'
import { SearchResult } from '@/lib/search/search'

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
    const results = await searchAll(q)
    res.status(200).json(results)
  } catch (error) {
    console.error('Search error:', error)
    res.status(500).json({ error: 'Failed to fetch search results' })
  }
}