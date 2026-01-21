import { notFound } from 'next/navigation'

type RecordPageProps = {
  params: { id: string }
}

async function getRecord(id: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/proxy/record?id=${encodeURIComponent(id)}`,
    { cache: 'no-store' }
  )

  if (!res.ok) return null
  return res.json()
}

export default async function RecordPage({ params }: RecordPageProps) {
  const record = await getRecord(params.id)

  if (!record) notFound()

  return (
    <main style={{ padding: '24px', maxWidth: 900 }}>
      <h1 style={{ fontWeight: 800, marginBottom: 12 }}>
        {record.title}
      </h1>

      {/* Metadata */}
      <section
        style={{
          border: '1px solid #ccc',
          padding: 12,
          marginBottom: 20,
          fontFamily: 'monospace',
          fontSize: 13,
        }}
      >
        <div><strong>Type:</strong> {record.recordType ?? 'Unknown'}</div>
        <div><strong>Jurisdiction:</strong> {record.jurisdiction ?? 'Unknown'}</div>
        <div><strong>Date:</strong> {record.date ?? 'Not specified'}</div>
        <div><strong>Agency:</strong> {record.agency ?? 'Unknown'}</div>
        <div><strong>Source:</strong> {record.source ?? 'Unknown'}</div>
      </section>

      {/* Actions */}
      <section style={{ display: 'flex', gap: 12 }}>
        {record.url && (
          <a
            href={record.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#002868',
              color: '#fff',
              padding: '8px 14px',
              textDecoration: 'none',
            }}
          >
            Open Original Document
          </a>
        )}
      </section>
    </main>
  )
}
