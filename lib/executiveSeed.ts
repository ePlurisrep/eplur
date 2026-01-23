import type { GovernmentNode } from '@/types/government'

export const executiveNodes: GovernmentNode[] = [
  {
    id: 'branch-executive',
    type: 'branch',
    name: 'Executive Branch',
  },
  {
    id: 'office-president',
    type: 'office',
    name: 'President of the United States',
    parentId: 'branch-executive',
  },
  {
    id: 'office-vice-president',
    type: 'office',
    name: 'Vice President of the United States',
    parentId: 'branch-executive',
  },
  {
    id: 'eop',
    type: 'body',
    name: 'Executive Office of the President',
    parentId: 'branch-executive',
  },
  {
    id: 'eop-omb',
    type: 'agency',
    name: 'Office of Management and Budget',
    parentId: 'eop',
  },
  {
    id: 'eop-nsc',
    type: 'agency',
    name: 'National Security Council',
    parentId: 'eop',
  },
  {
    id: 'dept-justice',
    type: 'department',
    name: 'Department of Justice',
    parentId: 'branch-executive',
  },
  {
    id: 'dept-defense',
    type: 'department',
    name: 'Department of Defense',
    parentId: 'branch-executive',
  },
]

export default executiveNodes
