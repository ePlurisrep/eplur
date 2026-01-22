import { notFound } from 'next/navigation'
import Link from 'next/link'

async function getMember(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? ''
  const url = `${base}/api/congress/member/${encodeURIComponent(id)}`
  const res = await fetch(url)
  if (!res.ok) return null
  const data = await res.json()
  return data.member ?? null
}

async function CommitteeList({ bioguideId }: { bioguideId: string }) {
  const res = await fetch(`/api/government/member/${encodeURIComponent(bioguideId)}/committees`, { cache: 'no-store' })
  if (!res.ok) return <div style={{ color: '#666' }}>No committee data available.</div>
  const payload = await res.json()
  const memberships = payload.memberships ?? []
  if (!memberships.length) return <div style={{ color: '#666' }}>No committee memberships.</div>

  // group by congress number, descending
  memberships.sort((a: any, b: any) => b.congress - a.congress)
  const groups: Record<number, any[]> = {}
  memberships.forEach((m: any) => {
    groups[m.congress] = groups[m.congress] || []
    groups[m.congress].push(m)
  })

  return (
    <div>
      {Object.keys(groups)
        .sort((a, b) => Number(b) - Number(a))
        .map((c) => (
          <div key={c} style={{ marginBottom: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 6 }}>Congress {c}</div>
            <ul style={{ margin: 0 }}>
              {groups[Number(c)].map((m: any, i: number) => (
                <li key={i} style={{ fontFamily: 'monospace' }}>
                  {m.committee?.name ?? m.committeeCode} — {m.role}
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  )
}

export default async function MemberPage({ params }: { params: { bioguideId: string } }) {
  const member = await getMember(params.bioguideId)
  if (!member) notFound()

  return (
    <div className="grid grid-cols-[300px_1fr] gap-6">
      {/* LEFT RAIL */}
      <aside className="border-r pr-4 text-sm">
        <h1 className="font-semibold text-lg">{member.name}</h1>
        <p>{member.chamber}</p>
        <p>{member.state}</p>
        <p className="text-xs opacity-60">Bioguide ID: {member.bioguideId}</p>

        <div className="mt-4 space-y-1">
          {member.contact?.website && (
            <a href={member.contact.website} target="_blank">Official Website</a>
          )}
          {member.contact?.phone && (
            <p>Phone: {member.contact.phone}</p>
          )}
          {member.contact?.office && (
            <p>Office: {member.contact.office}</p>
          )}
        </div>
      </aside>

      {/* MAIN DOSSIER */}
      <section className="space-y-6">
        <div>
          <h2 className="font-semibold">Service Timeline</h2>
          <ul className="mt-2 space-y-2">
            {Array.isArray(member.terms) && member.terms.map((term: any, i: number) => (
              <li key={i} className="border-l pl-4">
                Congress {term.congress} · {term.startYear}–{term.endYear ?? 'Present'} · {term.party}
              </li>
            ))}
          </ul>
        </div>
          <section style={{ marginBottom: 20 }}>
            <h3 style={{ fontFamily: 'Georgia, serif' }}>Committee Involvement</h3>
            <div style={{ border: '1px solid #ddd', padding: 12 }}>
              {/** server fetch committee memberships for this member **/}
              {
                /* eslint-disable-next-line react-hooks/rules-of-hooks */
              }
              {
                // fetch memberships
              }
              <div>
                {/* server-side fetch to internal API */}
                {
                  (() => null)()
                }
                {await CommitteeList({ bioguideId: member.bioguideId })}
              </div>
            </div>
              </section>
            </section>
            </div>
  )
}
