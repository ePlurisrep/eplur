import { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { SearchResult } from '../lib/search/search'
import { highlightHtml, highlightText } from '@/lib/highlight'

export const metadata = {
  title: 'Search U.S. Government Data & Policy',
  description:
    'Search datasets, regulations, and official U.S. government documents from Data.gov, Census, and GovInfo.',
}

const Home = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

  // Use shared HTML-safe highlighter

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
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

      {!query && results.length === 0 && !loading && (
        <div className="empty-state">
          <p>Try searching for topics like:</p>
          <div className="suggestions">
            <span>inflation</span>
            <span>housing</span>
            <span>healthcare</span>
            <span>climate</span>
            <span>education</span>
          </div>
        </div>
      )}

      {results.length > 0 && (
        <div className="results">
          <h2>Results ({results.length})</h2>
          <div className="result-list">
            {results.map((result, index) => (
              <Link key={index} href={`/dataset/${encodeURIComponent(result.title)}`} className="result-item-link">
                <div className="result-item">
                  <h3 className="result-title">
                    {highlightText(result.title, query)}
                  </h3>
                  <p className="result-agency">{result.agency}</p>
                  <span className="source-badge" data-source={result.source.toLowerCase().replace('.', '').replace(' ', '')}>{result.source}</span>
                  <p className="result-description">
                    {highlightText(
                      result.description || 'Official government dataset or document.',
                      query
                    )}
                  </p>
                  <span className="view-source-link">View Source →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </main>
    </div>
  )
}

export default Home
