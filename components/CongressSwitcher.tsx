"use client"
import { useState } from 'react'

export default function CongressSwitcher({
  current,
  congresses,
}: {
  current: number
  congresses: { congress: number; startYear: number; endYear: number }[]
}) {
  const [showPast, setShowPast] = useState(false)
  const currentEntry = congresses.find((c) => c.congress === current)
  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 12 }}>
        <button
          onClick={() => setShowPast(false)}
          style={{ padding: '8px 12px', background: showPast ? '#f5f5f5' : '#002868', color: showPast ? '#000' : '#fff', border: 'none', cursor: 'pointer' }}
        >
          Current Congress
        </button>

        <button
          onClick={() => setShowPast(true)}
          style={{ padding: '8px 12px', background: showPast ? '#002868' : '#f5f5f5', color: showPast ? '#fff' : '#000', border: 'none', cursor: 'pointer' }}
        >
          Past Congresses
        </button>
      </div>

      {!showPast && currentEntry && (
        <div style={{ border: '1px solid #ddd', padding: 12 }}>
          <strong>{currentEntry.congress}</strong>
          <div style={{ color: '#666' }}>
            {currentEntry.startYear} — {currentEntry.endYear}
          </div>
        </div>
      )}

      {showPast && (
        <div style={{ display: 'grid', gap: 8 }}>
          {congresses.map((c) => (
            <div key={c.congress} style={{ border: '1px solid #eee', padding: 8 }}>
              <strong>{c.congress}</strong>
              <div style={{ color: '#666' }}>{c.startYear} — {c.endYear}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
