// lib/government/types.ts

export type GovernmentNodeType =
  | 'branch'
  | 'chamber'
  | 'committee'
  | 'subcommittee'
  | 'agency'
  | 'court'
  | 'office'

export interface GovernmentNode {
  id: string
  externalId?: string

  type: GovernmentNodeType
  name: string
  description?: string

  parentId?: string
  jurisdiction?: string

  startDate?: string
  endDate?: string

  metadata?: Record<string, unknown>
}

export type GovernmentEdgeType =
  | 'oversees'
  | 'reports_to'
  | 'subordinate_to'
  | 'created_by'

export interface GovernmentEdge {
  from: string
  to: string
  type: GovernmentEdgeType
  startDate?: string
  endDate?: string
}
