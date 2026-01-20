"use client"

import React from 'react'
import type { PublicRecord } from '@/types/publicRecord'
import SaveToVault from '@/components/SaveToVault'

export default function RecordGridItem({ record }: { record: PublicRecord }) {
  const date = record.date ?? 'Not specified'

  return (
    <article className="record-card" style={{ border: '1px solid #ddd', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div>
        <a href={`/records/${encodeURIComponent(record.id)}`} className="record-title" style={{ fontWeight: 700, color: '#002868', textDecoration: 'none' }}>{record.title}</a>
      </div>

      <div style={{ color: '#111', fontSize: 13, fontFamily: 'monospace' }}>
        <div><strong>Type:</strong> {record.recordType ?? 'Unknown'}</div>
        <div><strong>Jurisdiction:</strong> {record.jurisdiction ?? 'Unknown'}</div>
        <div><strong>Date:</strong> {date}</div>
        <div><strong>Agency:</strong> {record.agency ?? 'Unknown'}</div>
        <div><strong>Source:</strong> {record.source ?? 'Unknown'}</div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: 8 }}>
        <a href={`/records/${encodeURIComponent(record.id)}`} style={{ background: '#002868', color: '#fff', padding: '6px 10px', textDecoration: 'none', display: 'inline-block' }}>View Record</a>
        <SaveToVault record={{ id: record.id, url: record.url, title: record.title, recordType: record.recordType }} />
      </div>
    </article>
  )
}
