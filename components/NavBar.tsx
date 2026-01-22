"use client"

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function NavBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <nav
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        padding: '12px 24px',
        borderBottom: '2px solid #002868',
        background: '#f9fafb',
        fontFamily: 'monospace',
      }}
    >
      <div style={{ fontWeight: 700 }}>
        <Link href="/" style={{ color: '#002868', textDecoration: 'none' }}>
          ePluris
        </Link>
        <span style={{ marginLeft: 12, fontSize: 12 }}>
          Out of many, one.
        </span>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        <form onSubmit={submitSearch} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            aria-label="Search public records"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            style={{ padding: '6px 8px', border: '1px solid #ccc', fontSize: 13 }}
          />
          <button type="submit" style={{ padding: '6px 10px', background: '#002868', color: '#fff', border: 'none', cursor: 'pointer' }}>
            Search
          </button>
        </form>

        <Link href="/search">Search</Link>
        <Link href="/vault">Vault</Link>
      </div>
    </nav>
  )
}
