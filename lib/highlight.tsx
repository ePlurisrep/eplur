import React from 'react'

export function escapeHtml(str: string): string {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')
}

export function highlightHtml(text: string | undefined | null, query: string | undefined | null): string {
  if (!text) return ''
  if (!query) return escapeHtml(text)

  const escaped = escapeHtml(text)
  const safeQuery = escapeRegExp(query)
  const re = new RegExp(`(${safeQuery})`, 'gi')
  return escaped.replace(re, '<mark>$1</mark>')
}

export function highlightText(text: string | undefined | null, query: string | undefined | null): React.ReactNode {
  if (!text) return null
  if (!query) return text

  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'))
  return parts.map((part, i) =>
    part.match(new RegExp(`^${escapeRegExp(query)}$`, 'i')) ? (
      <mark key={i}>{part}</mark>
    ) : (
      <span key={i}>{part}</span>
    )
  )
}
