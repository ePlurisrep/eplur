// lib/government/committeeSeed.ts
import type { CommitteeRecord, CommitteeMembership } from '@/types/committee'

export const COMMITTEES: CommitteeRecord[] = [
  {
    code: 'HSINT',
    name: 'House Intelligence Committee',
    chamber: 'House',
  },
  {
    code: 'SSGA',
    name: 'Senate Judiciary Committee',
    chamber: 'Senate',
  },
]

export const COMMITTEE_MEMBERSHIPS: CommitteeMembership[] = [
  { bioguideId: 'JD0001', committeeCode: 'HSINT', role: 'Chair', congress: 110 },
  { bioguideId: 'JS0001', committeeCode: 'HSINT', role: 'Member', congress: 110 },
  { bioguideId: 'SS0001', committeeCode: 'SSGA', role: 'Ranking Member', congress: 115 },
]

export default COMMITTEES
