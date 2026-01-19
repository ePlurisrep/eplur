export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/**
 * Return an HTML-safe string with matches wrapped in <strong> (case-insensitive).
 */
export function highlightHtml(text: string | undefined | null, query: string | undefined | null): string {
  if (!text) return ''
  if (!query) return escapeHtml(text)

  const escaped = escapeHtml(text)
  const safeQuery = escapeRegExp(query)
  const re = new RegExp(`(${safeQuery})`, 'gi')
  return escaped.replace(re, '<strong>$1</strong>')
}
