import { useState } from 'react'
import { SearchResult } from '../lib/search/search'

const Home = () => {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)

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
    <main className="container">
      <h1>Welcome to eplur</h1>
      <p>Unified US Gov Data Search</p>

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

      {results.length > 0 && (
        <div className="results">
          <h2>Results ({results.length})</h2>
          <ul className="result-list">
            {results.map((result, index) => (
              <li key={index} className="result-item">
                <h3>
                  <a href={result.url} target="_blank" rel="noopener noreferrer">
                    {result.title}
                  </a>
                  <span className="source-badge">{result.source}</span>
                </h3>
                <p className="agency">Agency: {result.agency}</p>
                {result.date && <p className="date">Last modified: {new Date(result.date).toLocaleDateString()}</p>}
                {result.description && <p className="description">{result.description}</p>}
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  )
}

export default Home
