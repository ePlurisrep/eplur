export type NodeType =
  | 'branch'
  | 'chamber'
  | 'committee'
  | 'subcommittee'
  | 'member'
  | 'bill'
  | 'code_artifact'
  | 'vote'
  | 'agency'
  | 'court'
  | 'case'
  | 'user_node'

export type RelationshipType =
  | 'CONTAINS'
  | 'OVERSEES'
  | 'MEMBER_OF'
  | 'SPONSORED'
  | 'VOTED_ON'
  | 'DECIDED'
  | 'APPOINTED'
  | 'RELATED_TO'
  | 'USER_DEFINED'
  | string

export type GraphNode = {
  id: string
  label: string
  type: NodeType
  group?: string
  description?: string
  metadata?: Record<string, any>
}

export type GraphEdge = {
  source: string
  target: string
  relationship: RelationshipType
  weight?: number
  metadata?: Record<string, any>
}

export default GraphNode
