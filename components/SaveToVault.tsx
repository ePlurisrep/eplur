'use client'

import { saveToVault } from '@/lib/vault'
export default function SaveToVault({ record, className }: { record: any; className?: string }) {
  return (
    <button
      type="button"
      className={className ?? 'epluris-btn'}
      onClick={() => saveToVault(record)}
      aria-label="Save to Vault"
    >
      Save to Vault
    </button>
  )
}
