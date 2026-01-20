"use client"
import React, { useState, useEffect } from 'react'

type VaultEntry = {
  id: string
  url: string
  title: string
  recordType: string
  savedAt: string
}

type Props = {
  record: {
    id: string
    url: string
    title: string
    recordType: string
  }
}

const STORAGE_KEY = 'epluris_vault'

export default function SaveToVault({ record }: Props) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const arr: VaultEntry[] = JSON.parse(raw)
        setSaved(arr.some((r) => r.id === record.id))
      }
    } catch (e) {
      // ignore
    }
  }, [record.id])

  function handleSave() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      const arr: VaultEntry[] = raw ? JSON.parse(raw) : []
      if (!arr.some((r) => r.id === record.id)) {
        arr.unshift({ id: record.id, url: record.url, title: record.title, recordType: record.recordType, savedAt: new Date().toISOString() })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(arr))
        setSaved(true)
      } else {
        setSaved(true)
      }
    } catch (e) {
      console.error('Failed to save to vault', e)
    }
  }

  return (
    <div>
      <button onClick={handleSave} style={{ background: '#fff', color: '#002868', border: '2px solid #002868', padding: '0.5rem 1rem', fontWeight: 'bold', cursor: 'pointer' }}>
        {saved ? 'Saved to Vault' : 'Save to Vault'}
      </button>
    </div>
  )
}
