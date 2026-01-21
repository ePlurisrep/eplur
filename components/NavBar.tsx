"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function NavBar() {
  const pathname = usePathname()
  const router = useRouter()
  const [query, setQuery] = useState('')

  function submitSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/search?q=${encodeURIComponent(query)}`)
  }

  function NavLink({ href, label }: { href: string; label: string }) {
    const active = pathname === href
    return (
      <Link
        href={href}
        style={{
          paddingBottom: 4,
          borderBottom: active ? '3px solid var(--gov-red)' : '3px solid transparent',
          fontWeight: active ? 700 : 500,
        }}
      >
        {label}
      </Link>
    )
  }

  return (
    <header style={{ borderBottom: '4px solid var(--gov-red)' }}>
      <nav
        style={{
          display: 'grid',
          gridTemplateColumns: 'auto 1fr auto',
          alignItems: 'center',
          gap: 16,
          padding: '12px 24px',
        }}
      >
        <div>
          <Link href="/" style={{ fontSize: 20, fontWeight: 800 }}>
            ePluris
          </Link>
          <div className="gov-mono" style={{ fontSize: 11 }}>
            Out of many, one.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 24, justifyContent: 'center' }}>
          <NavLink href="/search" label="Search" />
          <NavLink href="/vault" label="Vault" />
        </div>

        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <form onSubmit={submitSearch}>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search public records"
              style={{
                padding: '6px 8px',
                border: '1px solid var(--gov-border)',
                fontSize: 13,
              }}
            />
          </form>

          <Link href="/login" style={{ fontSize: 13 }}>
            Sign In
          </Link>
        </div>
      </nav>
    </header>
  )
}
