"use client"
import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import type { GovernmentNode } from '@/types/governmentNode'

const sampleGroups = [
  { id: 'leg', label: 'Legislative' },
  { id: 'exec', label: 'Executive' },
  { id: 'jud', label: 'Judicial' },
]

export default function GovernmentGraphCanvas() {
  const searchParams = useSearchParams()
  const nodeParam = searchParams?.get('node') ?? null

  const [expanded, setExpanded] = useState<string | null>(null)
  const [selected, setSelected] = useState<GovernmentNode | null>(null)

  useEffect(() => {
    if (nodeParam) {
      // In a real implementation we'd fetch node details by id.
      setSelected({ id: nodeParam, type: 'agency', name: nodeParam } as GovernmentNode)
      // heuristically expand the legislative group if id contains 'house' or 'senate'
      if (nodeParam.toLowerCase().includes('senate') || nodeParam.toLowerCase().includes('house')) setExpanded('leg')
    }
  }, [nodeParam])

  return (
    <div style={{ minHeight: 420, border: '1px solid #e6e6e6', borderRadius: 8, padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {sampleGroups.map((g) => (
          <button
            key={g.id}
            onClick={() => setExpanded(expanded === g.id ? null : g.id)}
            style={{ padding: '6px 10px' }}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1, background: '#fafafa', borderRadius: 6, padding: 12 }}>
          {expanded ? (
            <div>
              <h4 style={{ marginTop: 0 }}>{sampleGroups.find((s) => s.id === expanded)?.label}</h4>
              <ul>
                <li onClick={() => setSelected({ id: 'example-agency', type: 'agency', name: 'Example Agency' } as GovernmentNode)} style={{ cursor: 'pointer' }}>
                  Example Agency
                </li>
                <li style={{ color: '#666' }}>Committee A</li>
                <li style={{ color: '#666' }}>Committee B</li>
              </ul>
            </div>
          ) : (
            <div style={{ color: '#666' }}>Click a group to expand the hierarchy.</div>
          )}
        </div>

        <div style={{ width: 220, background: '#fff', border: '1px dashed #ddd', borderRadius: 6, padding: 10 }}>
          <div style={{ fontSize: 13, marginBottom: 8 }}>Canvas</div>
          <div style={{ height: 220, background: '#f6f8fa', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
            {selected ? (
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontWeight: 600 }}>{selected.name}</div>
                <div style={{ fontSize: 12, color: '#666' }}>{selected.type}</div>
              </div>
            ) : (
              'Graph rendering placeholder'
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
