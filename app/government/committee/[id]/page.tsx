import React from 'react'
import Link from 'next/link'
import { fetchCongressData, fetchCongressRelations } from '@/lib/fetchCongress'
import type { GovernmentNode } from '@/types/government'

type Props = { params: { id: string } }

export default async function Page({ params }: Props) {
  const id = params.id
  const nodes = await fetchCongressData()
  const relations = await fetchCongressRelations()

  const node = nodes.find((n) => n.id === id)
  if (!node) {
    return (
      <div>
        <h1>Not found</h1>
        <p>No government entity found for {id}</p>
      </div>
    )
  }

  // Subcommittees are children with parentId === id
  const subcommittees = nodes.filter((n) => n.parentId === id && n.type === 'subcommittee')

  // Members: relations where member serves_on or member_of this committee
  const memberRels = relations.filter((r) => (r.type === 'serves_on' || r.type === 'member_of') && r.toId === id)
  const members = memberRels.map((r) => nodes.find((n) => n.id === r.fromId)).filter(Boolean) as GovernmentNode[]

  // Related bills: referrals or sponsorships involving this committee
  const relatedBills = relations
    .filter((r) => r.type === 'referred_to' && r.toId === id)
    .map((r) => nodes.find((n) => n.id === r.fromId))
    .filter(Boolean) as GovernmentNode[]

  return (
    <main>
      <h1>{node.name}</h1>
      <section>
        <h3>Meta</h3>
        <dl>
          <div>
            <dt>Established</dt>
            <dd>{node.startDate ?? (node.metadata?.congress ? `Congress ${node.metadata.congress}` : '—')}</dd>
          </div>
          <div>
            <dt>Jurisdiction</dt>
            <dd>{String(node.metadata?.jurisdiction ?? node.metadata?.committeeType ?? 'Federal')}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3>Related Entities</h3>
        <ul>
          <li>
            <strong>Members</strong>
            <ul>
              {members.length ? (
                members.map((m) => (
                  <li key={m.id}>
                    <Link href={`/government/member/${encodeURIComponent(m.id)}`}>{m.name}</Link>
                  </li>
                ))
              ) : (
                <li>No members listed</li>
              )}
            </ul>
          </li>
          <li>
            <strong>Subcommittees</strong>
            <ul>
              {subcommittees.length ? (
                subcommittees.map((s) => (
                  <li key={s.id}>
                    <Link href={`/government/committee/${encodeURIComponent(s.id)}`}>{s.name}</Link>
                  </li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </li>
          <li>
            <strong>Related bills</strong>
            <ul>
              {relatedBills.length ? (
                relatedBills.map((b) => (
                  <li key={b.id}>{b.name || b.id}</li>
                ))
              ) : (
                <li>None</li>
              )}
            </ul>
          </li>
        </ul>
      </section>
    </main>
  )
}
