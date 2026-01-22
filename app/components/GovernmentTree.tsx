"use client"

import React from 'react'
import type { GovernmentNode } from '@/types/government'

export function GovernmentTree({ nodes }: { nodes: GovernmentNode[] }) {
  // group by parent for simple tree rendering
  const byParent = nodes.reduce<Record<string, GovernmentNode[]>>((acc, node) => {
    const parent = node.parentId ?? 'root'
    acc[parent] = acc[parent] || []
    acc[parent].push(node)
    return acc
  }, {})

  function render(parentId = 'root') {
    return (
      <ul style={{ listStyle: 'none', paddingLeft: 12 }}>
        {(byParent[parentId] || []).map((node) => (
          <li key={node.id} style={{ marginBottom: 6 }}>
            <a href={`/records/${encodeURIComponent(node.id)}`} style={{ color: '#002868', textDecoration: 'none' }}>{node.name}</a>
            {render(node.id)}
          </li>
        ))}
      </ul>
    )
  }

  return render()
}

export default GovernmentTree
