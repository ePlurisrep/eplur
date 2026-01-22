"use client"

import React from 'react'

type PropsByYear = { year: number; setYear: (y: number) => void }
type PropsRange = { min?: number; max?: number; value: number; onChange: (v: number) => void }

export default function TimeSlider(props: PropsByYear | PropsRange) {
  const isRange = 'value' in props && typeof (props as any).onChange === 'function'

  if (isRange) {
    const { min = 1789, max = new Date().getFullYear(), value, onChange } = props as PropsRange
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#666' }}>
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    )
  }

  const { year, setYear } = props as PropsByYear
  return (
    <div className="my-4">
      <label className="block font-semibold">Year: {year}</label>
      <input
        type="range"
        min={1789}
        max={new Date().getFullYear()}
        value={year}
        onChange={(e) => setYear(Number(e.target.value))}
        className="w-full"
      />
    </div>
  )
}
