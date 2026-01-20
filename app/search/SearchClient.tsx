"use client"

import React, { useState } from 'react'

type PublicRecord = {
  id: string
  title: string
  recordKind: string
  dateStart?: string
  dateEnd?: string
  jurisdiction?: string
  agency?: string
  source: 'data.gov' | 'congress.gov' | 'state' | 'local' | string
  url: string
  description?: string
}

function normalizeResult(item: any, idx: number): PublicRecord {
  const title = item.title ?? item.name ?? 'Untitled'
  const id = String(item.id ?? item.identifier ?? item._id ?? `${title}-${idx}`)

  // recordKind: prefer explicit type; otherwise use source hints or fallback to 'Unknown'
  let recordKind = (item.recordKind || item.type || item.kind || '').toString()
  if (!recordKind) {
    if ((item.source || '').toString().toLowerCase().includes('data.gov')) recordKind = 'Dataset'
    else recordKind = 'Unknown'
  }

  const dateStart = item.date || item.date_start || item.metadata_modified || undefined
  const dateEnd = item.date_end || undefined
  const jurisdiction = item.jurisdiction ?? item.country ?? item.jurisdiction_name ?? undefined
  const agency = item.agency ?? item.agencyName ?? item.organization ?? undefined
  const source = (item.source ?? item.provider ?? 'unknown').toString()
  const url = item.url ?? item.link ?? item.resourceUrl ?? item.download_url ?? '#'

  return {
    id,
    title,
    recordKind,
    dateStart,
    dateEnd,
    jurisdiction,
    agency,
    source: source as PublicRecord['source'],
    url,
    description: item.description ?? item.summary ?? item.abstract ?? undefined,
  }
}

export default function SearchClient() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[] | null>(null)
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
    <div style={{ padding: 40 }}>
      <h1>Search</h1>
      <p>Search public U.S. government data sources.</p>

      <form onSubmit={handleSearch} style={{ marginTop: 16 }}>
        <div className="epluris-search-label">SEARCH U.S. PUBLIC RECORDS</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search U.S. public records"
            className="epluris-search-bar"
          />
          <button type="submit" disabled={loading} className="epluris-btn">
            {loading ? 'SEARCHING...' : 'SEARCH'}
          </button>
        </div>
      </form>

      <section style={{ marginTop: 24 }}>
        {results === null && <div style={{ color: '#666' }}>No results yet — enter a query above.</div>}

        {results !== null && results.length === 0 && (
          <div style={{ color: '#666' }}>No records matched the query.</div>
        )}

        {results !== null && results.length > 0 && (
          <div>
            <div style={{ marginBottom: 12, color: '#333' }}>{results.length} results</div>
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, 320px)', gridAutoRows: '1fr', alignItems: 'stretch' }}>
              {results.map((r, i) => {
                const rec = normalizeResult(r, i)
                const date = rec.dateStart ? (rec.dateEnd ? `${rec.dateStart} — ${rec.dateEnd}` : rec.dateStart) : 'Not specified'
                return (
                  <article key={rec.id} className="record-briefing" style={{ display: 'flex', flexDirection: 'column' }}>
                    <header>
                      <a href={rec.url || '#'} target="_blank" rel="noreferrer" className="record-title epluris-link">
                        {rec.title}
                      </a>
                    </header>

                    <div className="record-meta">
                      {`${rec.recordKind ?? 'Unknown'} | ${date} | ${rec.jurisdiction ?? 'Unknown'}`}
                    </div>

                    <div className="epluris-separator" />
                    <div style={{ color: '#333', marginTop: 8, flex: '1 1 auto' }}>
                      <p style={{ margin: 0 }}>{rec.description ?? 'Not specified'}</p>
                    </div>

                    <div className="epluris-separator" />
                    <div style={{ marginTop: 8 }}>
                      <span className="epluris-label">Source:</span> <span className="record-source">{rec.source}</span>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
