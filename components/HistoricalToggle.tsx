"use client"
import { useState } from 'react'

export default function HistoricalToggle({
  currentLabel = 'Current Congress',
  pastLabel = 'Past Congresses',
}: {
  currentLabel?: string
  pastLabel?: string
}) {
  const [showPast, setShowPast] = useState(false)
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <button
        onClick={() => setShowPast(false)}
        style={{
          padding: '8px 12px',
          background: showPast ? '#f5f5f5' : '#002868',
          color: showPast ? '#000' : '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {currentLabel}
      </button>

      <button
        onClick={() => setShowPast(true)}
        style={{
          padding: '8px 12px',
          background: showPast ? '#002868' : '#f5f5f5',
          color: showPast ? '#fff' : '#000',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {pastLabel}
      </button>

      <span style={{ marginLeft: 8, color: '#666' }}>
        {showPast ? 'Showing historic congresses' : 'Showing current congress'}
      </span>
    </div>
  )
}
