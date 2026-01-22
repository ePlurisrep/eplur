"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

export default function GovernmentTimeline() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialYear = Number(searchParams?.get('year') ?? '') || 2026
  const [year, setYear] = useState<number>(initialYear)

  useEffect(() => {
    // keep year in sync when URL changes externally
    const p = Number(searchParams?.get('year') ?? '')
    if (!isNaN(p) && p !== year) setYear(p)
  }, [searchParams])

  function updateYear(y: number) {
    setYear(y)
    const params = new URLSearchParams(Array.from((searchParams ?? new URLSearchParams()).entries()))
    params.set('year', String(y))
    router.push(`/government?${params.toString()}`)
  }

  return (
    <div style={{ padding: 12, border: '1px solid #ddd', borderRadius: 8 }}>
      <div style={{ marginBottom: 8, fontSize: 14 }}>Timeline</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 120, fontSize: 13, color: '#333' }}>1789 — 2026</div>
        <input
          aria-label="timeline"
          type="range"
          min={1789}
          max={2026}
          value={year}
          onChange={(e) => updateYear(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <div style={{ width: 72, textAlign: 'right', fontWeight: 'bold' }}>{year}</div>
      </div>
    </div>
  )
}
