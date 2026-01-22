import Link from 'next/link'

export const metadata = {
  title: 'Members — Legislative — ePluris',
}

export default async function MembersIndexPage() {
  const res = await fetch('/api/congress/members')
  if (!res.ok) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Members</h1>
        <p>Unable to load members list.</p>
      </main>
    )
  }

  const data = await res.json()
  const members = data.members ?? []

  function isActive(terms: any[]) {
    if (!Array.isArray(terms) || terms.length === 0) return false
    const last = terms[terms.length - 1]
    return !last.endYear || last.endYear >= new Date().getFullYear()
  }

  return (
    <main style={{ padding: 24, maxWidth: 1200 }}>
      <h1>Members</h1>
      <p style={{ maxWidth: 720 }}>Discovery index of canonical Member records. Click a member for the dossier.</p>

      <section style={{ marginTop: 20 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #ddd' }}>
              <th style={{ padding: 8 }}>Name</th>
              <th style={{ padding: 8 }}>Chamber</th>
              <th style={{ padding: 8 }}>State</th>
              <th style={{ padding: 8 }}>Active</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m: any) => (
              <tr key={m.bioguideId} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: 8 }}>
                  <Link href={`/government/legislative/member/${encodeURIComponent(m.bioguideId)}`} style={{ color: '#002868', fontWeight: 700 }}>
                    {m.name}
                  </Link>
                </td>
                <td style={{ padding: 8 }}>{m.chamber}</td>
                <td style={{ padding: 8 }}>{m.state}</td>
                <td style={{ padding: 8, fontFamily: 'monospace' }}>{isActive(m.terms) ? 'Active' : 'Inactive'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  )
}
