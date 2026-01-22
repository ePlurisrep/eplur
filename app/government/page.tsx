export const metadata = {
  title: 'United States Government — ePluris',
}

export default function GovernmentPage() {
  return (
    <main style={{ padding: '24px', maxWidth: 1200 }}>
      <h1 style={{ marginBottom: 8 }}>United States Government</h1>
      <p style={{ maxWidth: 720 }}>
        The United States Government is divided into three co-equal branches
        established by the Constitution. Each branch has distinct powers,
        responsibilities, and institutional structures.
      </p>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
          marginTop: 32,
        }}
      >
        <BranchCard
          title="Legislative Branch"
          description="Congress, consisting of the House of Representatives and the Senate, is responsible for making federal law."
          href="/government/legislative"
        />

        <BranchCard
          title="Executive Branch"
          description="The President, Vice President, Cabinet, and federal agencies responsible for enforcing federal law."
          href="/government/executive"
        />

        <BranchCard
          title="Judicial Branch"
          description="The federal court system, headed by the Supreme Court, interprets and applies federal law."
          href="/government/judicial"
        />
      </section>
    </main>
  )
}

function BranchCard({
  title,
  description,
  href,
}: {
  title: string
  description: string
  href: string
}) {
  return (
    <article
      style={{
        border: '1px solid #ccc',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <h2 style={{ margin: 0 }}>{title}</h2>
      <p style={{ fontSize: 14 }}>{description}</p>
      <a
        href={href}
        style={{
          marginTop: 'auto',
          fontWeight: 700,
          color: '#002868',
          textDecoration: 'none',
        }}
      >
        View →
      </a>
    </article>
  )
}
