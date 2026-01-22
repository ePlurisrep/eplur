"use client"

import React, { useState } from 'react'
import ResultCard from '@/components/ResultCard'

type PublicRecord = {
  id: string
  title: string
  recordType: string
  jurisdiction?: string
  date?: string
  agency?: string
  source: 'data.gov' | 'congress.gov' | 'state' | 'local' | string
  url: string
  description?: string
}

function normalizeResult(item: any, idx: number): PublicRecord {
  const title = item.title ?? item.name ?? 'Untitled'
  const id = String(item.id ?? item.identifier ?? item._id ?? `${title}-${idx}`)

  let recordType = (item.recordType || item.recordKind || item.type || item.kind || '').toString()
  if (!recordType) {
    if ((item.source || '').toString().toLowerCase().includes('data.gov')) recordType = 'Dataset'
    else recordType = 'Unknown'
  }

  const dstart = item.date || item.date_start || item.metadata_modified || undefined
  const dend = item.date_end || undefined
  const date = dstart && dend ? `${dstart} — ${dend}` : dstart ?? undefined
  const jurisdiction = item.jurisdiction ?? item.country ?? item.jurisdiction_name ?? undefined
  const agency = item.agency ?? item.agencyName ?? item.organization ?? undefined
  const source = (item.source ?? item.provider ?? 'unknown').toString()
  const url = item.url ?? item.link ?? item.resourceUrl ?? item.download_url ?? '#'

  return {
    id,
    title,
    recordType,
    date,
    jurisdiction,
    agency,
    source: source as PublicRecord['source'],
    url,
    description: item.description ?? item.summary ?? item.abstract ?? undefined,
  }
}

export default function Home() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PublicRecord[] | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query.trim()) return
    setLoading(true)
    try {
      const res = await fetch(`/api/proxy/search?q=${encodeURIComponent(query)}`)
      const data = await res.json()
      console.log('search results', data)
      const rawList = Array.isArray(data) ? data : (data && data.results) ? data.results : []
      const list = rawList.map(normalizeResult)
      setResults(list)
    } catch (err) {
      console.error('Search error', err)
      setResults([])
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
        {results === null && <div style={{ color: '#666' }}>No results yet — enter a query above.</div>}

        {results !== null && results.length === 0 && (
          <div style={{ color: '#666' }}>No results for “{query}”. Try a different term.</div>
        )}

        {results !== null && results.length > 0 && (
          <div>
            <div style={{ marginBottom: 12, color: '#333' }}>{results.length} results</div>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, 320px)', gridAutoRows: '1fr', alignItems: 'stretch' }}>
              {results.map((rec) => (
                <div key={rec.id}>
                  <ResultCard result={rec} />
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
