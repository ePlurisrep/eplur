"use client"

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import RecordGridItem from '@/components/RecordGridItem'
import { normalizeSearchResult } from '@/lib/normalizeSearchResult'
import type { PublicRecord } from '@/types/publicRecord'

export default function SearchClient() {
  const searchParams = useSearchParams()

  const query = searchParams?.get('q') ?? ''
  const type = searchParams?.get('type') ?? 'all'
  const jurisdiction = searchParams?.get('jurisdiction') ?? ''
  const from = searchParams?.get('from') ?? ''
  const to = searchParams?.get('to') ?? ''

  const [records, setRecords] = useState<PublicRecord[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) {
      setRecords([])
      return
    }

    setLoading(true)
    const params = new URLSearchParams()
    params.set('q', query)
    if (type && type !== 'all') params.set('type', type)
    if (jurisdiction) params.set('jurisdiction', jurisdiction)
    if (from) params.set('from', from)
    if (to) params.set('to', to)

    fetch(`/api/proxy/search?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        const raw = data.results ?? []
        setRecords(raw.map(normalizeSearchResult))
      })
      .catch((e) => {
        console.error('Search error', e)
        setRecords([])
      })
      .finally(() => setLoading(false))
  }, [query, type, jurisdiction, from, to])

  if (loading) return <p>Searching…</p>

  return (
    <section className="results-grid">
      {records.map((r) => (
        <RecordGridItem key={r.id} record={r} />
      ))}
    </section>
  )
}
