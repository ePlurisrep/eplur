"use client"

import React, { useState } from 'react'
import { normalizeSearchResult } from '@/lib/normalizeSearchResult'
import RecordGridItem from '@/components/RecordGridItem'
import type { PublicRecord } from '@/types/publicRecord'

export default function SearchClient() {
  const [query, setQuery] = useState('')

  const [records, setRecords] = useState<PublicRecord[]>([])
  const [mode, setMode] = useState<'broad' | 'strict'>('broad')
  const [typeFilter, setTypeFilter] = useState('all')
  const [jurisdictionFilter, setJurisdictionFilter] = useState('all')
  const [loading, setLoading] = useState(false)

  async function runSearch() {
    if (!query.trim()) return

    setLoading(true)

    try {
      const res = await fetch(`/api/proxy/search?q=${encodeURIComponent(query)}&mode=${mode}`)
      const data = await res.json()

      const raw = data.results ?? (Array.isArray(data) ? data : [])
      const normalized = raw.map((r: any, i: number) =>
        normalizeSearchResult(r, i)
      )

      setRecords(normalized)
    } catch (e) {
      console.error('Search error', e)
    } finally {
      setLoading(false)
    }
  }

  /* Note: always render the search UI (search bar + filters); show idle message in results area when no records */

  /* ───────────────
     LOADING STATE
  ─────────────── */
  if (loading) {
    return (
      <section style={{ padding: '48px 0', textAlign: 'center', color: '#555' }}>
        <p style={{ fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: 1 }}>
          Retrieving records…
        </p>
      </section>
    )
  }

  /* ───────────────
     RESULTS
  ─────────────── */
  return (
    <>
      <section
        style={{
          display: 'flex',
          gap: 8,
          padding: 12,
          border: '2px solid #002868',
          background: '#f5f5f5',
          fontFamily: 'monospace'
        }}
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') runSearch()
          }}
          placeholder="Enter record, event, agency, or law…"
          style={{
            flex: 1,
            padding: 8,
            fontSize: 14,
            border: '1px solid #333'
          }}
        />

        <button
          onClick={runSearch}
          disabled={loading}
          style={{
            padding: '8px 14px',
            background: '#002868',
            color: '#fff',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          {loading ? 'SEARCHING…' : 'SEARCH'}
        </button>
      </section>
      <div style={{ display: 'flex', gap: 12, padding: '8px 12px', fontSize: 12, fontFamily: 'monospace' }}>
        <label>
          <input
            type="radio"
            checked={mode === 'broad'}
            onChange={() => setMode('broad')}
          />{' '}
          Broad (discovery)
        </label>

        <label>
          <input
            type="radio"
            checked={mode === 'strict'}
            onChange={() => setMode('strict')}
          />{' '}
          Strict (precision)
        </label>
      </div>
      <section
        style={{
          display: 'flex',
          gap: 12,
          padding: '12px 0',
          borderBottom: '2px solid #002868',
          marginBottom: 16,
        }}
      >
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="all">All Record Types</option>
          <option value="Dataset">Dataset</option>
          <option value="Report">Report</option>
          <option value="Filing">Filing</option>
        </select>

        <select value={jurisdictionFilter} onChange={(e) => setJurisdictionFilter(e.target.value)}>
          <option value="all">All Jurisdictions</option>
          <option value="Federal">Federal</option>
          <option value="State">State</option>
          <option value="Local">Local</option>
        </select>
      </section>
      <header style={{ marginBottom: 24 }}>
        <div style={{ fontFamily: 'monospace', textTransform: 'uppercase', color: '#002868' }}>
          Investigation: <strong>{query}</strong>
        </div>
        <div style={{ fontSize: 13, color: '#444' }}>
          Records found: {records.length}
        </div>
      </header>

      <section
        className="results-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16
        }}
      >
        {records.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center', color: '#666', gridColumn: '1/-1' }}>
            {loading ? 'Retrieving records…' : 'No records — try a different query.'}
          </div>
        ) : (
          (() => {
            const filteredRecords = records.filter((r) => {
              if (typeFilter !== 'all' && r.recordType !== typeFilter) return false
              if (jurisdictionFilter !== 'all' && r.jurisdiction !== jurisdictionFilter) return false
              return true
            })

            if (filteredRecords.length === 0) {
              return (
                <div style={{ padding: 48, textAlign: 'center', color: '#666', gridColumn: '1/-1' }}>
                  No records match the selected filters.
                </div>
              )
            }

            return filteredRecords.map((record) => (
              <RecordGridItem key={record.id} record={record} />
            ))
          })()
        )}
      </section>
    </>
  )
}
