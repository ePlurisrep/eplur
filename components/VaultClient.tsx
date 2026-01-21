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
