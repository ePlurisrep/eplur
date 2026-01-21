"use client"

import React, { useEffect, useState } from 'react'
import { getVault } from '@/lib/vault'

export default function RecordViewer({ id }: { id: string }) {
  const [record, setRecord] = useState<any | null>(null)

  useEffect(() => {
    const vault = getVault()
    const found = vault.find((r: any) => r.id === id)
    setRecord(found || null)
  }, [id])

  if (!record) return <p style={{ padding: 24 }}>Record not found.</p>

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ margin: 0 }}>{record.title}</h1>

      {record.url ? (
        <iframe
          src={record.url}
          style={{
            width: '100%',
            height: '80vh',
            border: '1px solid #002868',
            marginTop: 16,
          }}
        />
      ) : (
        <p style={{ marginTop: 16 }}>No previewable URL for this record.</p>
      )}
    </main>
  )
}
