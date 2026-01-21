"use client"

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { normalizeSearchResult } from '@/lib/normalizeSearchResult'
import RecordGridItem from '@/components/RecordGridItem'
import type { PublicRecord } from '@/types/publicRecord'
import FiltersPanel, { Filters } from '@/components/FiltersPanel'

export default function SearchClient() {
  const searchParams = useSearchParams()

  const initialQuery = searchParams?.get('q') ?? ''
  const initialMode = (searchParams?.get('mode') as 'broad' | 'strict') ?? 'broad'
  const initialType = searchParams?.get('type') ?? 'all'

  const [query, setQuery] = useState(initialQuery)
  const [mode, setMode] = useState<'broad' | 'strict'>(initialMode)
  const [typeFilter, setTypeFilter] = useState(initialType)
  const [filters, setFilters] = useState<Filters>({ recordType: '', jurisdiction: '', agency: '' })
  const [records, setRecords] = useState<PublicRecord[]>([])
  const [loading, setLoading] = useState(false)

  async function runSearch() {
    if (!query.trim()) return

    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.set('q', query)
      params.set('mode', mode)
      if (typeFilter) params.set('type', typeFilter)
      if (filters.recordType) params.set('recordType', filters.recordType)
      if (filters.jurisdiction) params.set('jurisdiction', filters.jurisdiction)
      if (filters.agency) params.set('agency', filters.agency)

      const res = await fetch(`/api/proxy/search?${params.toString()}`)
      const data = await res.json()
      const raw = data.results ?? (Array.isArray(data) ? data : [])
      const normalized = raw.map((r: any, i: number) => normalizeSearchResult(r, i))
      setRecords(normalized)
    } catch (e) {
      console.error('Search error', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr' }}>
      <FiltersPanel filters={filters} setFilters={setFilters} />

      <section
        className="results-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 16,
          padding: 16,
        }}
      >
        {records
          .filter((r) =>
            (!filters.recordType ||
              r.recordType?.toLowerCase().includes(filters.recordType.toLowerCase())) &&
            (!filters.jurisdiction ||
              r.jurisdiction?.toLowerCase().includes(filters.jurisdiction.toLowerCase())) &&
            (!filters.agency ||
              r.agency?.toLowerCase().includes(filters.agency.toLowerCase()))
          )
          .map((record) => (
            <RecordGridItem key={record.id} record={record} />
          ))}
      </section>
    </div>
  )

}
