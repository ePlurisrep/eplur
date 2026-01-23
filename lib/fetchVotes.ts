import type { VoteNode } from '@/types/government'

export async function fetchVotes(billId: string, congress: number, type: string, number: string): Promise<VoteNode[]> {
  const res = await fetch(
    `https://api.congress.gov/v3/bill/${congress}/${type}/${number}/votes?api_key=${process.env.CONGRESS_API_KEY}`
  )

  const data = await res.json()
  if (!data.votes) return []

  return data.votes.flatMap((vote: any) =>
    (vote.positions || []).map((p: any) => ({
      id: `vote-${vote.rollCall}-${p.memberId}`,
      type: 'vote',
      name: `${p.vote}`,
      parentId: billId,
      billId: billId,
      memberId: p.memberId,
      position: p.vote,
      date: vote.date,
    }))
  )
}

export default fetchVotes
