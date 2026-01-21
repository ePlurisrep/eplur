"use client"

import React from 'react'
import type { PublicRecord } from '@/types/publicRecord'
import SaveToVault from '@/components/SaveToVault'

export default function RecordGridItem({ record }: { record: PublicRecord }) {
  return (
    <article
      className="record-item"
      style={{
        borderTop: '3px solid #B22234', // federal red
        borderBottom: '1px solid #ccc',
        padding: '14px 8px 16px',
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: 8,
        background: '#fff'
      }}
    >
      {/* HEADER */}
      <header style={{ display: 'grid', gap: 4 }}>
        <a
          href={`/record/${encodeURIComponent(record.id)}`}
          style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#002868', // federal blue
            textDecoration: 'none',
            lineHeight: 1.3
          }}
        >
          {record.title}
        </a>

        <div
          style={{
            fontSize: 12,
            fontFamily: 'monospace',
            color: '#555'
          }}
        >
          {record.recordType ?? 'Public Record'}
          {' · '}
          {record.jurisdiction ?? 'United States'}
          {record.date ? ` · ${record.date}` : ''}
        </div>
      </header>

      {/* METADATA GRID */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '140px 1fr',
          rowGap: 4,
          fontSize: 12,
          fontFamily: 'monospace'
        }}
      >
        <div><strong>Agency</strong></div>
        <div>{record.agency ?? 'Unknown'}</div>

        <div><strong>Source</strong></div>
        <div>{record.source ?? 'Public Record'}</div>

        <div><strong>Record ID</strong></div>
        <div style={{ wordBreak: 'break-all' }}>{record.id}</div>
      </section>

      {/* ACTIONS */}
      <footer
        style={{
          display: 'flex',
          gap: 8,
          marginTop: 6
        }}
      >
        <a
          href={`/record/${encodeURIComponent(record.id)}`}
          style={{
            background: '#002868',
            color: '#fff',
            padding: '6px 10px',
            fontSize: 12,
            fontFamily: 'monospace',
            textDecoration: 'none'
          }}
        >
          View Record
        </a>

        <a
          href={record.url}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            border: '1px solid #002868',
            color: '#002868',
            padding: '6px 10px',
            fontSize: 12,
            fontFamily: 'monospace',
            textDecoration: 'none'
          }}
        >
          Open Source
        </a>

        <SaveToVault
          record={{
            id: record.id,
            title: record.title,
            url: record.url,
            recordType: record.recordType
          }}
        />
      </footer>
    </article>
  )
}
