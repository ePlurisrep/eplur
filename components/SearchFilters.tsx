"use client"

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const [type, setType] = useState<string>(searchParams?.get('type') ?? 'all')
  const [jurisdiction, setJurisdiction] = useState<string>(searchParams?.get('jurisdiction') ?? '')
  const [from, setFrom] = useState<string>(searchParams?.get('from') ?? '')
  const [to, setTo] = useState<string>(searchParams?.get('to') ?? '')

  useEffect(() => {
    // keep local state in sync if user navigates with Back/Forward
    setType(searchParams?.get('type') ?? 'all')
    setJurisdiction(searchParams?.get('jurisdiction') ?? '')
    setFrom(searchParams?.get('from') ?? '')
    setTo(searchParams?.get('to') ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams?.toString()])

  function updateUrl(paramsUpdater: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(Array.from(searchParams?.entries?.() ?? []))
    paramsUpdater(params)
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}`)
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', padding: 16, fontFamily: 'monospace' }}>
      <h4 style={{ marginTop: 0 }}>Filters</h4>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12 }}>Record Type</label>
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value)
            updateUrl((p) => {
              if (e.target.value && e.target.value !== 'all') p.set('type', e.target.value)
              else p.delete('type')
            })
          }}
          style={{ width: '100%', padding: 6 }}
        >
          <option value="all">All</option>
          <option value="dataset">Dataset</option>
          <option value="document">Document</option>
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12 }}>Jurisdiction</label>
        <input
          value={jurisdiction}
          onChange={(e) => setJurisdiction(e.target.value)}
          onBlur={() => updateUrl((p) => { if (jurisdiction) p.set('jurisdiction', jurisdiction); else p.delete('jurisdiction') })}
          placeholder="Federal, State…"
          style={{ width: '100%', padding: 6 }}
        />
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: 'block', fontSize: 12 }}>From</label>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} onBlur={() => updateUrl((p) => { if (from) p.set('from', from); else p.delete('from') })} style={{ width: '100%', padding: 6 }} />
      </div>

      <div style={{ marginBottom: 8 }}>
        <label style={{ display: 'block', fontSize: 12 }}>To</label>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} onBlur={() => updateUrl((p) => { if (to) p.set('to', to); else p.delete('to') })} style={{ width: '100%', padding: 6 }} />
      </div>

      <div style={{ marginTop: 8 }}>
        <button
          type="button"
          onClick={() => {
            // clear filters
            setType('all')
            setJurisdiction('')
            setFrom('')
            setTo('')
            updateUrl((p) => {
              p.delete('type')
              p.delete('jurisdiction')
              p.delete('from')
              p.delete('to')
            })
          }}
          style={{ padding: '6px 10px' }}
        >
          Clear
        </button>
      </div>
    </div>
  )
}
