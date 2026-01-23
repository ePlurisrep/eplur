import type { GovernmentNode } from '@/types/government'

export const supremeCourtNodes: GovernmentNode[] = [
  {
    id: 'branch-judicial',
    type: 'branch',
    name: 'Judicial Branch',
  },
  {
    id: 'court-supreme',
    type: 'body',
    name: 'Supreme Court of the United States',
    parentId: 'branch-judicial',
  },
]

export default supremeCourtNodes
