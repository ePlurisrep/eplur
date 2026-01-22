"use client"

import React from 'react'
import type { PublicRecord } from '@/types/publicRecord'
import SaveToVault from '@/components/SaveToVault'

export default function ResultCard({ result }: { result: PublicRecord }) {
  const title = result.title ?? result.id
  const summary = typeof result.summary === 'string' ? result.summary : (typeof (result as any).description === 'string' ? (result as any).description : undefined)
  const agency = typeof result.agency === 'string' ? result.agency : undefined
  const url = result.url ?? '#'

  return (
    <article
      style={{
        background: '#fff',
        padding: 14,
        borderRadius: 8,
        boxShadow: '0 1px 4px rgba(12,24,40,0.04)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 120,
      }}
    >
      <div>
        <a
          href={`/records/${encodeURIComponent(result.id)}`}
          style={{ display: 'block', fontSize: 16, fontWeight: 700, color: '#0b57d0', textDecoration: 'none', marginBottom: 6 }}
        >
          {title}
        </a>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12, color: '#666' }}>
          <div>Agency: {agency ?? 'Not specified'}</div>
          <div>Type: {result.recordType ?? 'Not specified'}</div>
          <div>Jurisdiction: {result.jurisdiction ?? 'Not specified'}</div>
          <div>Date: {result.date ?? 'Not specified'}</div>
        </div>
      </div>

      <div style={{ marginTop: 10, color: '#222', flex: '1 1 auto' }}>
        <p style={{ margin: 0, lineHeight: 1.5, fontSize: 14 }}>{summary ?? (result.source ? `Source: ${result.source}` : 'No summary available.')}</p>
      </div>

      <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
        <a href={`/preview?url=${encodeURIComponent(url)}`} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#0b57d0' }}>Preview</a>
        <a href={url} target="_blank" rel="noreferrer" style={{ fontSize: 13, color: '#0b57d0' }}>Open Source</a>
        <div style={{ marginLeft: 'auto' }}>
          <SaveToVault record={{ id: result.id, title, url, recordType: result.recordType }} />
        </div>
      </div>
    </article>
  )
}

