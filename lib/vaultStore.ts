import { VaultRecord } from '@/types/vaultRecord'

let vault: VaultRecord[] = []

export function addToVault(record: VaultRecord) {
  vault.push(record)
}

export function getVault() {
  return vault
}
