import { getCommitteeById } from '@/lib/government/congress'

export async function generateStaticParams() {
  // provide a small set of known committees for static routing
  return [{ id: 'intelligence' }]
}

export default async function CommitteePage({ params }: { params: { id: string } }) {
  const { id } = params
  const overview = await getCommitteeById(id)

  if (!overview) return <main style={{ padding: 24 }}>Committee not found.</main>

  return (
    <main style={{ padding: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 28 }}>{overview.name}</h1>
        <p style={{ color: '#444' }}>{overview.jurisdiction}</p>
      </header>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontFamily: 'Georgia, serif' }}>Current Members</h2>
        <ul>
          {overview.currentMembers?.map((m, i) => (
            <li key={i} style={{ fontFamily: 'monospace' }}>{m.name} — {m.role ?? m.party}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: 18 }}>
        <h3 style={{ fontFamily: 'Georgia, serif' }}>Historical Members</h3>
        {overview.historicalMembers && overview.historicalMembers.length > 0 ? (
          <ul>
            {overview.historicalMembers.map((h, i) => (
              <li key={i} style={{ fontFamily: 'monospace' }}>{h.name} — {h.startDate} — {h.endDate}</li>
            ))}
          </ul>
        ) : (
          <div style={{ color: '#666' }}>No historical member data available.</div>
        )}
      </section>

      <section style={{ marginTop: 18 }}>
        <h3 style={{ fontFamily: 'Georgia, serif' }}>Linked datasets</h3>
        <ul>
          {overview.linkedDatasets?.map((d, i) => (
            <li key={i}><a href={`/search?q=${encodeURIComponent(d.query)}`}>{d.type}</a></li>
          ))}
        </ul>
      </section>
    </main>
  )
}
