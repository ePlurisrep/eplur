"use client"

import React from 'react'

export default function Breadcrumbs({ parts }: { parts: { href?: string; label: string }[] }) {
  return (
    <nav style={{ fontSize: 13, color: '#666', marginBottom: 12 }} aria-label="Breadcrumbs">
      {parts.map((p, i) => (
        <span key={i}>
          {p.href ? <a href={p.href} style={{ color: '#666' }}>{p.label}</a> : <span>{p.label}</span>}
          {i < parts.length - 1 && <span style={{ margin: '0 8px' }}>/</span>}
        </span>
      ))}
    </nav>
  )
}
