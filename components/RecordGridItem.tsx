"use client"

import React from 'react'
import type { PublicRecord } from '@/types/publicRecord'
import SaveToVault from '@/components/SaveToVault'

export default function RecordGridItem({ record }: { record: PublicRecord }) {
  const date = record.date ?? 'Not specified'

  return (
    <article
      style={{
        border: '1px solid #ccc',
        padding: 12,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto',
        gap: 8,
        background: '#fff',
      }}
    >
      <header>
        <a
          href={`/record/${encodeURIComponent(record.id)}`}
          style={{
            fontWeight: 700,
            color: '#002868',
            textDecoration: 'none',
            fontSize: 15,
          }}
        >
          {record.title}
        </a>
        <div style={{ fontSize: 11, textTransform: 'uppercase', color: '#444' }}>
          {record.recordType ?? 'Public Record'}
        </div>
      </header>

      <section style={{ fontFamily: 'monospace', fontSize: 12 }}>
        <div><strong>Jurisdiction:</strong> {record.jurisdiction ?? '—'}</div>
        <div><strong>Agency:</strong> {record.agency ?? '—'}</div>
        <div><strong>Date:</strong> {record.date ?? '—'}</div>
      </section>

      <footer style={{ display: 'flex', gap: 8 }}>
        <a
          href={`/record/${encodeURIComponent(record.id)}`}
          style={{ background: '#002868', color: '#fff', padding: '6px 10px', textDecoration: 'none' }}
        >
          View
        </a>
        <a
          href={record.url}
          target="_blank"
          rel="noreferrer"
          style={{ border: '1px solid #aaa', padding: '6px 10px', textDecoration: 'none', color: 'inherit' }}
        >
          Source
        </a>
      </footer>
      {record.tags && (
        <div style={{ marginTop: 8 }}>
          <input
            placeholder="Add tags (comma separated)"
            defaultValue={(record.tags || []).join(', ')}
            style={{ fontSize: 12, padding: 6, width: '100%' }}
          />
        </div>
      )}
    </article>
  )
}
