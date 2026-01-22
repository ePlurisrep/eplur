export type CongressMember = {
  bioguideId: string
  name: string
  chamber: 'House' | 'Senate'
  state: string
  party: string
  district?: string
  imageUrl?: string

  terms: {
    congress: number
    startYear: number
    endYear?: number
    party: string
  }[]

  contact?: {
    website?: string
    phone?: string
    office?: string
  }
}

export default CongressMember
