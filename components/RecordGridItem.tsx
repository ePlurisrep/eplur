import React from 'react'
import type { PublicRecord } from '@/types/publicRecord'

export function RecordGridItem({ record }: { record: PublicRecord }) {
  const date = record.dateStart ? (record.dateEnd ? `${record.dateStart} — ${record.dateEnd}` : record.dateStart) : 'Not specified'
  return (
    <article className="record-briefing record-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <header style={{ marginBottom: 8 }}>
        <a href={record.url} target="_blank" rel="noreferrer" className="record-title epluris-link">
          {record.title}
        </a>
      </header>

      <div className="record-meta" style={{ marginBottom: 8 }}>
        {`${record.recordKind ?? 'Unknown'} | ${date} | ${record.jurisdiction ?? 'Unknown'}`}
      </div>

      <div style={{ color: '#333', flex: '1 1 auto' }}>
        <p style={{ margin: 0 }}>{record.description ?? 'Not specified'}</p>
      </div>

      <div className="epluris-separator" />
      <footer style={{ marginTop: 8 }}>
        <span className="epluris-label">Source</span>: <span className="record-source">{record.source ?? 'Not specified'}</span>
      </footer>
    </article>
  )
}

export default RecordGridItem
