const KEY = 'epluris-vault'

export function getVault() {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? '[]')
  } catch (e) {
    return []
  }
}

export function saveToVault(record: any) {
  const existing = getVault()
  if (existing.find((r: any) => r.id === record.id)) return
  localStorage.setItem(KEY, JSON.stringify([...existing, record]))
}

export function removeFromVault(id: string) {
  if (typeof window === 'undefined') return
  const remaining = getVault().filter((r: any) => r.id !== id)
  localStorage.setItem(KEY, JSON.stringify(remaining))
}

