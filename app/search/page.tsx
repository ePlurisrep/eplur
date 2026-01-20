"use client"

import { useEffect, useState } from 'react'
import { normalizeSearchResult } from '@/lib/normalizeSearchResult'
import { RecordGridItem } from '@/components/RecordGridItem'
import type { PublicRecord } from '@/types/publicRecord'

export const metadata = {
  title: 'Search — ePluris',
}

export default function SearchPage() {
  const [records, setRecords] = useState<PublicRecord[]>([])

  useEffect(() => {
    async function runSearch() {
      const res = await fetch('/api/proxy/search?q=hate')
      const data = await res.json()

      const raw = data.results ?? (Array.isArray(data) ? data : [])

      const normalized = raw.map((r: any, i: number) => normalizeSearchResult(r, i))

      setRecords(normalized)
    }

    runSearch()
  }, [])

  return (
    <section className="results-grid">
      {records.map((record) => (
        <RecordGridItem key={record.id} record={record} />
      ))}
    </section>
  )
}
