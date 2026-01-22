"use client"
import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

export default function GovernmentAnalysisPanel() {
  const searchParams = useSearchParams()
  const nodeParam = searchParams?.get('node') ?? null
  const yearParam = searchParams?.get('year') ?? null
  const [nodeId, setNodeId] = useState<string | null>(null)

  useEffect(() => {
    if (nodeParam) setNodeId(nodeParam)
  }, [nodeParam])

  return (
    <aside style={{ border: '1px solid #eee', borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8 }}>Analysis</div>

      <section style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: '600' }}>Overview</div>
        <div style={{ fontSize: 13, color: '#444' }}>{nodeId ? `Node: ${nodeId}` : 'Select a node to view details.'}</div>
      </section>

      <section style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: '600' }}>Structure</div>
        <div style={{ fontSize: 13, color: '#444' }}>Parent / children / oversight relationships</div>
      </section>

      <section style={{ marginBottom: 12 }}>
        <div style={{ fontWeight: '600' }}>Records</div>
        <div style={{ fontSize: 13, color: '#444' }}>{nodeId ? `Showing records near ${yearParam ?? 'present'}` : 'Live ePluris data will appear here.'}</div>
      </section>

      <section>
        <div style={{ fontWeight: '600' }}>User Layer</div>
        <div style={{ fontSize: 13, color: '#444' }}>Tags · Saved records · Notes (Vault)</div>
      </section>
    </aside>
  )
}
