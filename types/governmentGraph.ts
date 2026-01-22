export type GovernmentEdgeType =
  | 'oversees'
  | 'reports_to'
  | 'member_of'
  | 'subordinate_to'
  | 'created_by'

export interface GovernmentEdge {
  from: string
  to: string
  type: GovernmentEdgeType
  startDate?: string
  endDate?: string
}

export interface RecordLink {
  recordId: string
  nodeId: string
  relevanceType:
    | 'oversight'
    | 'legislation'
    | 'budget'
    | 'investigation'
    | 'judicial_review'

  startDate?: string
  endDate?: string
  confidence?: number
}

export default RecordLink
