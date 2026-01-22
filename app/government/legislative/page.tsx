import legislative from '@/lib/government/legislativeStructure.json'
import CongressSwitcher from '@/components/CongressSwitcher'

export const metadata = {
  title: 'Legislative Branch — ePluris',
}

export default function LegislativePage() {
  const data = legislative as any
  return (
    <main style={{ padding: '24px', maxWidth: 1200 }}>
      <h1 style={{ fontFamily: 'serif', fontSize: 36 }}>{data.label}</h1>

      <p style={{ maxWidth: 720 }}>{data.description}</p>

      <section style={{ marginTop: 24 }}>
        <h2>Overview</h2>
        <p>
          Congress is the national legislature of the United States. This page
          provides a stable structural skeleton — terminology, hierarchy, and
          canonical labels — that will be hydrated with live data by the
          server-side API layer.
        </p>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 24 }}>
        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <h3>Constitutional Role</h3>
          <p>Congress's authority comes from Article I of the Constitution.</p>
        </div>

        <div style={{ border: '1px solid #ddd', padding: 16 }}>
          <h3>Bicameral Structure</h3>
          <p>The legislature is bicameral: the House of Representatives and the Senate.</p>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Congress</h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0 }}>Viewing: <strong>{data.currentCongress}th Congress</strong></p>
            <p style={{ margin: 0, color: '#666' }}>Data will be loaded from the server-side API; UI is intentionally static.</p>
          </div>
          <div>
            <button disabled style={{ padding: '8px 12px', background: '#f5f5f5', border: '1px solid #ddd' }}>Toggle (disabled)</button>
          </div>
        </div>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>House</h2>
        <p>The House of Representatives is composed of members elected to two-year terms.</p>
        <p><a href="#">Members (future)</a></p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Senate</h2>
        <p>The Senate is composed of members elected to six-year terms, with staggered classes.</p>
        <p><a href="#">Members (future)</a></p>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Committees</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
          <div style={{ border: '1px solid #eee', padding: 12 }}>
            <h4>Standing</h4>
            <ul>
              {data.structure.committees.standing.map((cm: any) => (
                <li key={cm.code}><a href={`/government/legislative/committees/${cm.code}`}>{cm.name} ({cm.code})</a></li>
              ))}
            </ul>
          </div>

          <div style={{ border: '1px solid #eee', padding: 12 }}>
            <h4>Select</h4>
            <p>Placeholder for select committees.</p>
          </div>

          <div style={{ border: '1px solid #eee', padding: 12 }}>
            <h4>Joint</h4>
            <p>Placeholder for joint committees.</p>
          </div>
        </div>
        <details style={{ marginTop: 12 }}>
          <summary>Subcommittees (collapsed)</summary>
          <p style={{ color: '#666' }}>Subcommittees will be listed here when available.</p>
        </details>
      </section>

      <section style={{ marginTop: 24 }}>
        <h2>Historical Mode</h2>
        <p>Historical comparators and timelines will be available here. (Placeholder)</p>
      </section>
    </main>
  )
}

function InfoBlock({
  title,
  items,
}: {
  title: string
  items: string[]
}) {
  return (
    <div style={{ border: '1px solid #ddd', padding: 16 }}>
      <h3>{title}</h3>
      <ul>
        {items.map((i) => (
          <li key={i}>{i}</li>
        ))}
      </ul>
    </div>
  )
}
