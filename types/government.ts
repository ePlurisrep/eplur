// Authoritative government node schema (tree + time-aware + API-aligned)
export type GovernmentNodeType =
  | 'branch'
  | 'body'
  | 'committee'
  | 'subcommittee'
  | 'member'
  | 'bill'
  | 'userNode'
  | 'office'
  | 'role'
  | 'root'

export interface GovernmentNode {
  id: string
  type: GovernmentNodeType

  name: string
  shortName?: string
  description?: string

  parentId?: string | null
  branch?: 'executive' | 'legislative' | 'judicial'

  // ISO-8601 date strings for historical tracking
  startDate?: string
  endDate?: string | null

  // Flexible metadata for API alignment and visuals
  metadata?: {
    congress?: number
    chamber?: 'House' | 'Senate'
    state?: string
    party?: string
    district?: string
    role?: string
    committeeType?: string
    [key: string]: unknown
  }

  // Source identifiers / provenance
  sources?: {
    congressGovId?: string
    url?: string
    [key: string]: unknown
  }
}

export default GovernmentNode

// Non-tree relationships (members serving on committees, chairs, etc.)
export interface GovernmentRelation {
  fromId: string
  toId: string
  type: 'serves_on' | 'chairs' | 'member_of' | 'sponsored_by' | 'referred_to'
  startDate?: string
  endDate?: string | null
}

// User research / workspace nodes (private/shared annotations)
export interface UserResearchNode extends GovernmentNode {
  ownerId: string
  visibility: 'private' | 'shared'
  content?: string
}
