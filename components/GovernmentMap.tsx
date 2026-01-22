"use client"
import { useState } from 'react'
import type { GovernmentNode } from '@/types/government'
import TimeSlider from '@/components/TimeSlider'

export default function GovernmentMap({ entities }: { entities: GovernmentNode[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [year, setYear] = useState<number>(new Date().getFullYear())

  // Initialize selection from URL query param `focus` (e.g. ?focus=member:JD0000)
  useState(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search)
        const f = params.get('focus')
        if (f) setSelected(f)
      }
    } catch (e) {
      // ignore
    }
    return null
  })

  const roots = entities.filter((e) => (e as any).parentId == null || (e as any).parentId === 'us_gov')

  function childrenOf(id: string) {
    // For now this is static; future: filter by `year` using startDate/endDate
    return entities.filter((e) => (e as any).parentId === id)
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 12 }}>
            {roots.map((r) => (
              <div key={r.id} style={{ border: '1px solid #ddd', padding: 16, flex: 1 }}>
                <h3 style={{ margin: 0 }}>{r.name}</h3>
                <div style={{ marginTop: 8 }}>
                  <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} style={{ padding: '6px 10px' }}>
                    {expanded === r.id ? 'Collapse' : 'Expand'}
                  </button>
                </div>

                {expanded === r.id && (
                  <div style={{ marginTop: 12 }}>
                    {childrenOf(r.id).map((c) => (
                      <div key={c.id} style={{ padding: 8, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{c.name}</div>
                            <div style={{ fontSize: 12, color: '#666' }}>{c.type}</div>
                        </div>
                        <div>
                          <button onClick={() => setSelected(c.id)} style={{ marginRight: 8 }}>Select</button>
                          {c.type === 'committee' && (
                            <a href={`/government/legislative/committees/${(c.id as string).replace('committee:','')}`}>View</a>
                          )}
                          {c.type === 'member' && (
                            <a href={`/government/legislative/member/${(c.id as string).replace('member:','')}`}>View</a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <aside style={{ width: 340, borderLeft: '1px solid #eee', paddingLeft: 16 }}>
          <h4>Details</h4>
          {selected ? (
            (() => {
              const ent = entities.find((e) => e.id === selected)
              if (!ent) return <div>Not found</div>
              return (
                <div>
                  <h3 style={{ marginTop: 0 }}>{ent.name}</h3>
                  <div style={{ color: '#666' }}>{ent.type}</div>
                  {(ent.metadata as any)?.jurisdiction && <div>Jurisdiction: {(ent.metadata as any).jurisdiction}</div>}
                  {ent.startDate && <div>From: {ent.startDate}</div>}
                  {ent.endDate && <div>To: {ent.endDate}</div>}
                  <div style={{ marginTop: 12 }}>
                    <a href={`/government/entity/${encodeURIComponent(ent.id)}`}>Open record</a>
                  </div>
                </div>
              )
            })()
          ) : (
            <div style={{ color: '#666' }}>Select a node to see details.</div>
          )}
        </aside>
      </div>

      <div style={{ marginTop: 18 }}>
        <TimeSlider min={1990} max={new Date().getFullYear()} value={year} onChange={(v) => setYear(v)} />
        <div style={{ marginTop: 8, color: '#666' }}>Viewing year: {year} — (map will update when historical data is enabled)</div>
      </div>
    </div>
  )
}
