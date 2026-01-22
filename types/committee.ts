export type CommitteeChamber = 'House' | 'Senate' | 'Joint'

export interface CommitteeRecord {
  code: string
  name: string
  chamber: CommitteeChamber
  parentCommittee?: string
}

export interface CommitteeMembership {
  bioguideId: string
  committeeCode: string
  role: 'Chair' | 'Ranking Member' | 'Member'
  congress: number
}

export default CommitteeRecord
