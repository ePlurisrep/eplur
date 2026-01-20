import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { SearchResult } from '../lib/search/search'
import { highlightHtml, highlightText } from '@/lib/highlight'

export const metadata = {
  title: 'Search U.S. Government Data & Policy',
  description:
    'Search datasets, regulations, and official U.S. government documents from Data.gov, Census, and GovInfo.',
}

const Home = ({ initialResults = [] }) => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(initialResults)
  const [loading, setLoading] = useState(false)

  // Real data fetch (client-side) — auto-run when ?q= is present
  const router = useRouter()
  const searchQuery = Array.isArray(router.query.q) ? router.query.q[0] : router.query.q

  useEffect(() => {
    if (!searchQuery) return
    setLoading(true)
    fetch(`/api/datagov?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then((data) => setResults(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error('Auto-search failed:', err)
        setResults([])
      })
      .finally(() => setLoading(false))
  }, [searchQuery])

  // Use shared HTML-safe highlighter

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/datagov?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <Head>
        <title>Search U.S. Government Data & Policy</title>
        <meta name="description" content="Search datasets, regulations, and official U.S. government documents from Data.gov, Census, and GovInfo." />
      </Head>
      <main className="container">
        <h1>Search U.S. Government Data & Policy Documents</h1>
        <p>A unified search across federal datasets, regulations, and public records — no login required.</p>

        <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search government data..."
          className="search-input"
        />
        <button type="submit" disabled={loading} className="search-button">
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {loading && (
        <p className="mt-6 text-gray-500">Searching government sources…</p>
      )}

      {!loading && searchQuery && results.length === 0 && (
        <p className="mt-6 text-gray-500">
          No results found for “{searchQuery}”
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {results.map((r, i) => (
          <li
            key={i}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-semibold text-blue-700"
            >
              {r.title}
            </a>

            <p className="text-sm text-gray-600 mt-1">
              {r.agency || 'U.S. Government'} · {r.source}
              {r.date ? ` · ${r.date}` : ''}
            </p>

            {r.description && (
              <p className="mt-2 text-gray-700">
                {r.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
    </div>
  )
}

export default Home
