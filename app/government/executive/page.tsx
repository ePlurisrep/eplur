export const metadata = {
  title: 'Executive Branch — ePluris',
}

export default function ExecutivePage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1200 }}>
      <h1>Executive Branch</h1>

      <p style={{ maxWidth: 720 }}>
        The Executive Branch carries out and enforces federal law. It includes the
        President, Vice President, Cabinet, and federal agencies tasked with
        administration and enforcement.
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
          title="Offices & Agencies"
          items={[
            'Executive Office of the President',
            'Cabinet Departments',
            'Independent Agencies',
          ]}
        />

        <InfoBlock
          title="Responsibilities"
          items={[
            'Execute and enforce laws',
            'Issue regulations and guidance',
            'Administer federal programs',
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
