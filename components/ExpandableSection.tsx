"use client"
import { useState, PropsWithChildren } from 'react'

export default function ExpandableSection({
  title,
  defaultOpen = false,
  children,
}: PropsWithChildren<{ title: string; defaultOpen?: boolean }>) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ border: '1px solid #eee', padding: 12, marginTop: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h4 style={{ margin: 0 }}>{title}</h4>
        <button onClick={() => setOpen(!open)} style={{ padding: '6px 10px' }}>{open ? '▾' : '▸'}</button>
      </div>
      {open && <div style={{ marginTop: 12 }}>{children}</div>}
    </div>
  )
}
