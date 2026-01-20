"use client"

import React, { useState } from 'react'

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/proxy/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      console.log('search results', data)
      setResults(data)
    } catch (err) {
      console.error('Search error', err)
      setResults({ error: String(err) })
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{ padding: 40 }}>
      <h1>ePluris</h1>
      <p>Out of many, one.</p>

      <form onSubmit={handleSearch} style={{ marginTop: 16 }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search government data..."
          style={{ padding: 8, width: 360 }}
        />
        <button type="submit" disabled={loading} style={{ marginLeft: 8, padding: '8px 12px' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <section style={{ marginTop: 24 }}>
        <h2>Results (raw)</h2>
        <pre style={{ background: '#f7f7f7', padding: 12, whiteSpace: 'pre-wrap' }}>
          {results ? JSON.stringify(results, null, 2) : 'No results yet'}
        </pre>
      </section>
    </main>
  )
}
