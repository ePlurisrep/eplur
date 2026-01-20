"use client"
import React, { useEffect, useState } from 'react'
import { normalizeSearchResult } from '@/lib/normalizeSearchResult'
import RecordGridItem from '@/components/RecordGridItem'
import type { PublicRecord } from '@/types/publicRecord'

export default function SearchClient() {
  const [records, setRecords] = useState<PublicRecord[]>([])

  useEffect(() => {
    let mounted = true
    async function runSearch() {
      try {
        const res = await fetch('/api/proxy/search?q=')
        const data = await res.json()
        const raw = data.results ?? (Array.isArray(data) ? data : [])
        const normalized = raw.map((r: any, i: number) => normalizeSearchResult(r, i))
        if (mounted) setRecords(normalized)
      } catch (e) {
        console.error('Search error', e)
      }
    }

    runSearch()
    return () => { mounted = false }
  }, [])

  return (
    <section className="results-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
      {records.map((record) => (
        <RecordGridItem key={record.id} record={record} />
      ))}
    </section>
  )
}
