"use client"

import React, { useState, useEffect } from 'react'
import { saveToVault } from '@/lib/vault'

type Props = {
  record: {
    id: string
    url?: string
    title: string
    recordType?: string
  }
}

export default function SaveToVault({ record }: Props) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem('epluris_vault')
      if (raw) {
        const arr = JSON.parse(raw)
        setSaved(arr.some((r: any) => r.id === record.id))
      }
    } catch (e) {
      // ignore
    }
  }, [record.id])

  function handleSave() {
    saveToVault({ id: record.id, title: record.title, url: record.url, recordType: record.recordType })
    setSaved(true)
  }

  return (
    <div>
      <button onClick={handleSave} style={{ border: '1px solid #444', padding: '6px 10px', background: saved ? '#eee' : '#fff', cursor: 'pointer' }}>
        {saved ? 'Saved' : 'Save'}
      </button>
    </div>
  )
}
