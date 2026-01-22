export const metadata = {
  title: 'Legislative Branch — ePluris',
}

export default function LegislativePage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1200 }}>
      <h1>Legislative Branch</h1>

      <p style={{ maxWidth: 720 }}>
        The Legislative Branch is established under Article I of the United
        States Constitution. Its primary responsibility is the creation of
        federal law.
      </p>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 24,
          marginTop: 32,
        }}
      >
        <InfoBlock
          title="Congress"
          items={[
            'House of Representatives',
            'Senate',
            'Joint Committees',
          ]}
        />

        <InfoBlock
          title="Powers"
          items={[
            'Draft and pass legislation',
            'Declare war',
            'Control federal spending',
            'Oversight of the Executive Branch',
          ]}
        />
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
