"use client"

import React from 'react'
import type { GovernmentNode } from '@/types/government'

export default function NodeCard({ node }: { node: GovernmentNode }) {
  return (
    <div style={{ border: '1px solid #eee', padding: 12, borderRadius: 6, background: '#fff' }}>
      <h2 style={{ margin: '0 0 8px 0' }}>{node.name}</h2>
      <div style={{ color: '#666', marginBottom: 8 }}>{node.type}{node.branch ? ` — ${node.branch}` : ''}</div>
      {node.description && <p style={{ marginTop: 0 }}>{node.description}</p>}
      {node.metadata && (
        <pre style={{ fontSize: 12, overflowX: 'auto', background: '#f8f8f8', padding: 8 }}>{JSON.stringify(node.metadata, null, 2)}</pre>
      )}
      {node.sources && (
        <div style={{ marginTop: 8 }}>
          {node.sources.url && (<div><a href={node.sources.url} target="_blank" rel="noreferrer">Source</a></div>)}
        </div>
      )}
    </div>
  )
}
