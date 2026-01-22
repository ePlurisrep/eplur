import Link from 'next/link'

export const metadata = {
  title: 'Congress — Legislative — ePluris',
}

export default async function CongressMembersPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ''}/api/congress/members`, { cache: 'no-store' })
  const payload = await res.json()
  const members = payload.members ?? []

  return (
    <main style={{ padding: 24, maxWidth: 1200 }}>
      <h1>Congress</h1>
      <p style={{ maxWidth: 720 }}>
        Members of the U.S. Congress (sample). Click a member for official details.
      </p>

      <section style={{ marginTop: 20 }}>
        <div style={{ display: 'grid', gap: 12 }}>
          {members.map((m: any) => (
            <article key={m.bioguideId} style={{ border: '1px solid #ddd', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700 }}>{m.name}</div>
                <div style={{ fontFamily: 'monospace', fontSize: 13, color: '#444' }}>{m.party} · {m.state} · {m.chamber}</div>
              </div>

              <div>
                <Link href={`/government/legislative/member/${encodeURIComponent(m.bioguideId)}`} style={{ color: '#002868', fontWeight: 700 }}>
                  View →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
