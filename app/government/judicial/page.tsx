export const metadata = {
  title: 'Judicial Branch — ePluris',
}

export default function JudicialPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1200 }}>
      <h1>Judicial Branch</h1>

      <p style={{ maxWidth: 720 }}>
        The Judicial Branch interprets federal law and adjudicates disputes. The
        Supreme Court and lower federal courts issue opinions and manage dockets
        that establish legal precedent.
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
          title="Courts"
          items={[
            'Supreme Court',
            'Federal Courts of Appeals',
            'Federal District Courts',
          ]}
        />

        <InfoBlock
          title="Functions"
          items={[
            'Interpret laws',
            'Adjudicate disputes',
            'Issue opinions and orders',
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
