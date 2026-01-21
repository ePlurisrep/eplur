'use client'

import { useEffect, useState } from 'react'
import { getVault, removeFromVault } from '@/lib/vault'
import type { VaultRecord } from '@/lib/vaultTypes'
import Link from 'next/link'

export default function VaultClient() {
  const [records, setRecords] = useState<VaultRecord[]>([])

  useEffect(() => {
    setRecords(getVault())
  }, [])

  if (!records.length) {
    return <p>No saved records yet.</p>
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {records.map((r) => (
        <li
          key={r.id}
          style={{
            borderBottom: '1px solid #ddd',
            padding: '12px 0',
          }}
        >
          <Link href={`/record/${r.id}`}>
            <strong>{r.title}</strong>
          </Link>

          <div style={{ fontSize: 13 }}>
            {r.agency} — {r.jurisdiction}
          </div>

          <button
            onClick={() => {
              removeFromVault(r.id)
              setRecords(getVault())
            }}
            style={{
              fontSize: 12,
              marginTop: 6,
              background: 'none',
              border: 'none',
              color: '#900',
              cursor: 'pointer',
            }}
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  )
}
"use client"

import React, { useEffect, useState } from 'react'
import { getVault } from '@/lib/vault'
import RecordGridItem from '@/components/RecordGridItem'

export default function VaultClient() {
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    setRecords(getVault())
  }, [])

  if (!records.length) {
    return <p style={{ padding: 24 }}>No records saved yet.</p>
  }

  return (
    <section
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 16,
      }}
    >
      {records.map((r) => (
        <RecordGridItem key={r.id} record={r} />
      ))}
    </section>
  )
}
