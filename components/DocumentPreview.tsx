"use client"

import React, { useState } from 'react'

export default function DocumentPreview({ url }: { url?: string }) {
  const [loaded, setLoaded] = useState(false)

  if (!url) return <p style={{ padding: 24 }}>No preview available.</p>

  if (!loaded) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <p style={{ marginBottom: 12 }}>This record supports preview.</p>
        <button
          onClick={() => setLoaded(true)}
          style={{
            background: '#b22234',
            color: '#fff',
            padding: '8px 14px',
            border: 'none',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Load Preview
        </button>
      </div>
    )
  }

  return (
    <iframe
      src={url}
      style={{ width: '100%', height: '100%', border: 'none' }}
    />
  )
}
