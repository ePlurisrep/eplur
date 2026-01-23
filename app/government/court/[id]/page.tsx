import React from 'react'
import Link from 'next/link'
import { fetchCongressData } from '@/lib/fetchCongress'
import type { GovernmentNode, JudicialNode } from '@/types/government'

type Props = { params: { id: string } }

export default async function Page({ params }: Props) {
  const id = params.id
  const nodes = await fetchCongressData()

  const node = nodes.find((n) => n.id === id) as JudicialNode | undefined
  if (!node) {
    return (
      <div>
        <h1>Not found</h1>
        <p>No court entity found for {id}</p>
      </div>
    )
  }

  // Judges / justices who have parentId === court id
  const judges = nodes.filter((n) => n.parentId === id && (n.type === 'official' || n.type === 'member'))

  return (
    <main>
      <h1>{node.name}</h1>
      <section>
        <h3>Meta</h3>
        <dl>
          <div>
            <dt>Court level</dt>
            <dd>{(node as JudicialNode).courtLevel ?? '—'}</dd>
          </div>
          <div>
            <dt>Established / Appointment</dt>
            <dd>{(node as JudicialNode).appointmentDate ?? node.startDate ?? '—'}</dd>
          </div>
        </dl>
      </section>

      <section>
        <h3>Related Entities</h3>
        <ul>
          <li>
            <strong>Judges / Justices</strong>
            <ul>
              {judges.length ? (
                judges.map((j) => (
                  <li key={j.id}>
                    <Link href={`/government/member/${encodeURIComponent(j.id)}`}>{j.name}</Link>
                  </li>
                ))
              ) : (
                <li>None listed</li>
              )}
            </ul>
          </li>
        </ul>
      </section>
    </main>
  )
}
