export function inferRecordKind(source: string): string {
  const s = (source || '').toLowerCase()

  if (s.includes('data.gov')) return 'Dataset'
  if (s.includes('sec')) return 'Financial Filing'
  if (s.includes('court') || s.includes('judicial')) return 'Court Record'
  if (s.includes('foia')) return 'FOIA Release'
  if (s.includes('cdc') || s.includes('nih')) return 'Public Health Record'
  if (s.includes('nypd') || s.includes('police')) return 'Law Enforcement Record'

  return 'Public Record'
}
