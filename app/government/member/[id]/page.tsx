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

  // Committees the member serves on: relations where fromId === member.id
  const serves = relations.filter((r) => r.fromId === id && (r.type === 'serves_on' || r.type === 'member_of'))
  const committees = serves.map((r) => nodes.find((n) => n.id === r.toId)).filter(Boolean) as GovernmentNode[]

  // Recent bills sponsored (if present in relations)
  const sponsored = relations.filter((r) => r.fromId === id && r.type === 'sponsored_by').map((r) => nodes.find((n) => n.id === r.toId)).filter(Boolean) as GovernmentNode[]

  return (
    <main>
      <h1>{node.name}</h1>
      <section>
        <h3>Meta</h3>
        <dl>
          <div>
            <dt>Member of</dt>
            <dd>{node.metadata?.chamber ?? '—'}</dd>
          </div>
          <div>
            <dt>State / Party</dt>
            <dd>{[node.metadata?.state, node.metadata?.party].filter(Boolean).join(' — ') || '—'}</dd>
          </div>
          <div>
            <dt>Term start</dt>
            <dd>{node.startDate ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3>Related Entities</h3>
        <ul>
          <li>
            <strong>Committees</strong>
            <ul>
              {committees.length ? (
                committees.map((c) => (
                  <li key={c.id}>
                    <Link href={`/government/committee/${encodeURIComponent(c.id)}`}>{c.name}</Link>
                  </li>
                ))
              ) : (
                <li>None listed</li>
              )}
            </ul>
          </li>
          <li>
            <strong>Sponsored bills</strong>
            <ul>
              {sponsored.length ? (
                sponsored.map((b) => (
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
