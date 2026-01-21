"use client"

import React from 'react'

export type Filters = {
  recordType?: string
  jurisdiction?: string
  agency?: string
}

export default function FiltersPanel({
  filters,
  setFilters,
}: {
  filters: Filters
  setFilters: (f: Filters) => void
}) {
  return (
    <aside
      style={{
        borderRight: '2px solid #002868',
        padding: 16,
        minWidth: 240,
        fontFamily: 'monospace',
        background: '#fafafa',
      }}
    >
      <strong style={{ display: 'block', marginBottom: 12 }}>
        FILTERS
      </strong>

      <label style={labelStyle}>
        Record Type
        <input
          style={inputStyle}
          onChange={(e) =>
            setFilters({ ...filters, recordType: e.target.value })
          }
        />
      </label>

      <label style={labelStyle}>
        Jurisdiction
        <input
          style={inputStyle}
          onChange={(e) =>
            setFilters({ ...filters, jurisdiction: e.target.value })
          }
        />
      </label>

      <label style={labelStyle}>
        Agency
        <input
          style={inputStyle}
          onChange={(e) =>
            setFilters({ ...filters, agency: e.target.value })
          }
        />
      </label>
    </aside>
  )
}

const labelStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  fontSize: 12,
  marginBottom: 12,
}

const inputStyle = {
  padding: 6,
  fontFamily: 'monospace',
  fontSize: 12,
}
