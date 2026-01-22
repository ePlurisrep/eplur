import { getHouseOverview } from '@/lib/government/congress'

export const metadata = {
  title: 'House — Legislative — ePluris',
}

export default async function HousePage() {
  const overview = await getHouseOverview()

  return (
    <main style={{ padding: 24 }}>
      <header>
        <h1 style={{ margin: 0, fontFamily: 'Georgia, serif', fontSize: 28 }}>{overview.name}</h1>
        <p style={{ color: '#444' }}>{overview.jurisdiction}</p>
      </header>

      <section style={{ marginTop: 20 }}>
        <h2 style={{ fontFamily: 'Georgia, serif' }}>Current Members (sample)</h2>
        <ul>
          {overview.currentMembers?.map((m, i) => (
            <li key={i} style={{ fontFamily: 'monospace' }}>{m.name} — {m.party} ({m.state})</li>
          ))}
        </ul>
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
