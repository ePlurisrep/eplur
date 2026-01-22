import type { GovernmentNode } from '@/types/government'
import legislative from '@/lib/government/legislativeStructure.json'

// Minimal static scaffold of canonical GovernmentEntity objects.
export const GOVERNMENT_ENTITIES: GovernmentNode[] = [
  {
    id: 'us_gov',
    type: 'root',
    name: 'United States Government',
    parentId: null,
    metadata: { source: 'local' },
  },
  {
    id: 'legislative',
    type: 'branch',
    name: legislative.label,
    parentId: 'us_gov',
    metadata: { source: 'local' },
  },
  {
    id: 'house',
    type: 'branch',
    name: 'House of Representatives',
    parentId: 'legislative',
    metadata: { jurisdiction: 'Federal', source: 'local' },
  },
  {
    id: 'senate',
    type: 'branch',
    name: 'Senate',
    parentId: 'legislative',
    metadata: { jurisdiction: 'Federal', source: 'local' },
  },
  // Map standing committees from the static scaffold into entities
  ...(legislative.structure?.committees?.standing || []).map((c: any) => ({
    id: `committee:${c.code}`,
    type: 'committee' as const,
    name: c.name,
    parentId: c.chamber?.toLowerCase() || 'legislative',
    metadata: { source: 'local', chamber: c.chamber },
  })),
]

export default GOVERNMENT_ENTITIES
