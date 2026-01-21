const KEY = 'epluris_vault'

export function getVault() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) || '[]')
  } catch (e) {
    return []
  }
}

export function saveToVault(record: any) {
  if (typeof window === 'undefined') return
  const vault = getVault()
  if (vault.find((r: any) => r.id === record.id)) return
  const entry = { ...record, savedAt: new Date().toISOString(), tags: record.tags || [] }
  vault.push(entry)
  localStorage.setItem(KEY, JSON.stringify(vault))
}

export function updateVaultEntry(id: string, patch: Partial<any>) {
  if (typeof window === 'undefined') return
  const vault = getVault()
  const idx = vault.findIndex((r: any) => r.id === id)
  if (idx === -1) return
  vault[idx] = { ...vault[idx], ...patch }
  localStorage.setItem(KEY, JSON.stringify(vault))
}

export function removeFromVault(id: string) {
  if (typeof window === 'undefined') return
  const vault = getVault().filter((r: any) => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(vault))
}
