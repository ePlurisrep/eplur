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
  authorityScope?: string[]

  startDate?: string
  endDate?: string

  metadata?: {
    chamber?: 'House' | 'Senate'
    partyControl?: string
    source?: string
  }
}

export default GovernmentNode
