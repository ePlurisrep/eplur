"use client"

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

type PublicRecord = {
  id: string
  title: string
  recordType: string
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

  // recordType: prefer explicit type; otherwise use source hints or fallback to 'Unknown'
  let recordType = (item.recordType || item.recordKind || item.type || item.kind || '').toString()
  if (!recordType) {
    if ((item.source || '').toString().toLowerCase().includes('data.gov')) recordType = 'Dataset'
    else recordType = 'Unknown'
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
    recordType,
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PublicRecord[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedSources, setSelectedSources] = useState<Record<string, boolean>>({
    'data.gov': true,
    'congress.gov': false,
    state: false,
    local: false,
    other: false,
  })

  useEffect(() => {
    // initialize from URL params (if present)
    const q = searchParams?.get('q') ?? ''
    setQuery(q)
    if (q) {
      // auto-run query from URL
      doSearch(q)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const doSearch = async (q: string) => {
    if (!q.trim()) return
    setLoading(true)
    try {
      const sourcesCsv = Object.entries(selectedSources).filter(([k, v]) => v).map(([k]) => k).join(',')
      const url = `/api/proxy/search?q=${encodeURIComponent(q)}${sourcesCsv ? `&sources=${encodeURIComponent(sourcesCsv)}` : ''}`
      const res = await fetch(url)
      const data = await res.json()
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

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!query.trim()) return
    // update URL so searches are shareable / bookmarkable
    const params = new URLSearchParams(Array.from(searchParams?.entries?.() ?? []))
    params.set('q', query)
    const sourcesCsv = Object.entries(selectedSources).filter(([k, v]) => v).map(([k]) => k).join(',')
    if (sourcesCsv) params.set('sources', sourcesCsv)
    else params.delete('sources')
    router.push(`${pathname}?${params.toString()}`)
    await doSearch(query)
  }

  return (
    <div style={{ padding: 40 }}>
      <style>{`
        .epluris-search-label { font-size:12px; text-transform:uppercase; letter-spacing:0.03em; color:#002868 }
        .epluris-search-bar { padding: 8px 10px; border: 1px solid #002868; width: 460px }
        .epluris-btn { background:#002868;color:#fff;border:2px solid #002868;padding:8px 12px;font-weight:700 }
        .record-card-compact { border:1px solid #ddd; padding:12px; display:flex; flex-direction:column; gap:8px; background:#fff }
        .record-card-compact h3 { margin:0; font-family: Georgia, 'Times New Roman', serif }
        .record-meta { font-family: monospace; color:#333; font-size:13px }
        .epluris-separator { height:1px;background:#eee;margin:8px 0 }
        .control-row a, .control-row button { background:#fff;color:#002868;border:1px solid #002868;padding:6px 8px;text-decoration:none;display:inline-block;border-radius:0 }
      `}</style>

      <h1>PUBLIC RECORDS INTAKE</h1>
      <p style={{ maxWidth: 680 }}>State the matter under investigation. Use concise keywords, names, agencies, or a brief case note — results are drawn from official public records.</p>

      <form onSubmit={handleSearch} style={{ marginTop: 16 }}>
        <div className="epluris-search-label">CASE INTAKE</div>
        <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search U.S. public records"
            className="epluris-search-bar"
            placeholder="e.g. 'housing permit fraud, Jefferson County'"
          />
          <button type="submit" disabled={loading} className="epluris-btn">
            {loading ? 'RUNNING...' : 'RUN SEARCH'}
          </button>
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <strong style={{ fontSize: 12, textTransform: 'uppercase', color: '#bf0a30' }}>SYSTEM FILTERS</strong>
            {Object.keys(selectedSources).map(key => (
              <label key={key} style={{ fontFamily: 'monospace', fontSize: 13 }}>
                <input
                  type="checkbox"
                  checked={!!selectedSources[key]}
                  onChange={() => setSelectedSources(prev => ({ ...prev, [key]: !prev[key] }))}
                /> {key.toUpperCase()}
              </label>
            ))}
          </div>
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
            <div style={{ display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fill, 360px)', gridAutoRows: '1fr', alignItems: 'stretch' }}>
              {results.map((r, i) => {
                const rec = normalizeResult(r, i)
                const date = rec.dateStart ? (rec.dateEnd ? `${rec.dateStart} — ${rec.dateEnd}` : rec.dateStart) : 'Not specified'
                return (
                  <article key={rec.id} className="record-card-compact" style={{ display: 'flex', flexDirection: 'column' }}>
                    <header>
                      <h3><a href={`/records/${encodeURIComponent(rec.id)}`} style={{ color: '#002868', textDecoration: 'none' }}>{rec.title}</a></h3>
                    </header>

                    <div className="record-meta">
                      {`${rec.recordType ?? 'Unknown'} | ${date} | ${rec.jurisdiction ?? 'Unknown'}`}
                    </div>

                    <div className="epluris-separator" />
                    <div style={{ color: '#333', marginTop: 8, flex: '1 1 auto' }}>
                      <p style={{ margin: 0 }}>{rec.description ?? 'Not specified'}</p>
                    </div>

                    <div className="epluris-separator" />
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center' }}>
                      <div><span className="epluris-label">Source:</span> <span className="record-source">{rec.source}</span></div>
                      <div className="control-row">
                        <a href={rec.url || '#'} target="_blank" rel="noreferrer">Open Source</a>
                        <a href={`/records/${encodeURIComponent(rec.id)}`} style={{ marginLeft: 8 }}>View Record</a>
                      </div>
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
