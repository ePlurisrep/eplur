import type { GovernmentNode } from '@/types/government'

export function filterByYear(nodes: GovernmentNode[], year: number) {
  return nodes.filter((n) => {
    const start = n.startDate ? Number(n.startDate) : -Infinity
    const end = n.endDate ? Number(n.endDate) : Infinity
    return year >= start && year <= end
  })
}
