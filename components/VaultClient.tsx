'use client'

import React, { useEffect, useState } from 'react'
import { getVault, removeFromVault } from '@/lib/vault'
import ResultCard from '@/components/ResultCard'

export default function VaultClient() {
  const [records, setRecords] = useState<any[]>([])

  useEffect(() => {
    setRecords(getVault())
  }, [])

  if (!records.length) return <p style={{ padding: 24 }}>No records saved yet.</p>

  return (
    <section style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12, background: '#f6f7f9', borderRadius: 8 }}>
      {records.map((r) => (
        <div key={r.id} style={{ background: '#fff', padding: 12, borderRadius: 6 }}>
          <ResultCard result={r} />
          <div style={{ marginTop: 8, textAlign: 'right' }}>
            <button
              onClick={() => {
                removeFromVault(r.id)
                setRecords(getVault())
              }}
              style={{ fontSize: 12, background: '#fff', border: '1px solid #ddd', padding: '6px 10px', color: '#900', cursor: 'pointer', borderRadius: 4 }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </section>
  )
}
