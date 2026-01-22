import type { GovernmentNode } from '@/types/government'

// Canonical mapping (camelCase-friendly) — used internally
export function toFlourish(nodes: GovernmentNode[]) {
  return nodes.map((n) => ({
    id: n.id,
    parentId: n.parentId ?? undefined,
    label: n.name,
    type: n.type,
    start: n.startDate ?? undefined,
    end: n.endDate ?? undefined,
  }))
}

// Flourish adapter: snake_case keys expected by some Flourish templates
export function toFlourishSnake(nodes: GovernmentNode[]) {
  return nodes.map((n) => ({
    id: n.id,
    parent_id: n.parentId ?? undefined,
    label: n.name,
    type: n.type,
    start: n.startDate ?? undefined,
    end: n.endDate ?? undefined,
  }))
}

export function toFlourishCSV(nodes: GovernmentNode[]) {
  const rows = [] as string[]
  const header = ['id', 'parentId', 'label', 'type', 'start', 'end']
  rows.push(header.join(','))
  for (const r of toFlourish(nodes)) {
    rows.push([
      r.id,
      r.parentId ? `"${String(r.parentId).replace(/"/g, '""')}"` : '',
      `"${String(r.label).replace(/"/g, '""')}"`,
      r.type,
      r.start ?? '',
      r.end ?? '',
    ].join(','))
  }
  return rows.join('\n')
}

export function toFlourishSnakeCSV(nodes: GovernmentNode[]) {
  const rows = [] as string[]
  const header = ['id', 'parent_id', 'label', 'type', 'start', 'end']
  rows.push(header.join(','))
  for (const r of toFlourishSnake(nodes)) {
    rows.push([
      r.id,
      r.parent_id ? `"${String(r.parent_id).replace(/"/g, '""')}"` : '',
      `"${String(r.label).replace(/"/g, '""')}"`,
      r.type,
      r.start ?? '',
      r.end ?? '',
    ].join(','))
  }
  return rows.join('\n')
}
