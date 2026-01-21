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
          <>
            <a
              href={record.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                background: 'var(--gov-blue)',
                color: '#fff',
                padding: '8px 14px',
                textDecoration: 'none',
              }}
            >
              Open Original Document
            </a>

            <a
              href={record.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ marginLeft: 8, fontSize: 13, color: 'var(--gov-blue)' }}
            >
              View in new tab
            </a>
          </>
        )}
      </section>

      {/* Preview area: attempt embed/iframe where appropriate but always show source link */}
      <section style={{ marginTop: 18 }}>
        {record.contentType?.toLowerCase().includes('pdf') && record.url ? (
          <div>
            <embed src={record.url} type="application/pdf" width="100%" height={700} />
            <div style={{ marginTop: 8 }}>
              <a href={record.url} target="_blank" rel="noopener noreferrer">Open original (new tab)</a>
            </div>
          </div>
        ) : record.contentType?.toLowerCase().includes('html') && record.url ? (
          <div>
            <iframe
              src={record.url}
              sandbox="allow-scripts allow-forms"
              style={{ width: '100%', height: 700, border: '1px solid var(--gov-border)' }}
              title="Record preview"
            />
            <div style={{ marginTop: 8 }}>
              <a href={record.url} target="_blank" rel="noopener noreferrer">Open original (new tab)</a>
            </div>
          </div>
        ) : (
          <div style={{ padding: 12, border: '1px solid var(--gov-border)', background: 'var(--gov-gray)' }}>
            <div style={{ marginBottom: 8 }}>Preview not available for this record type. You can open the source below.</div>
            {record.url && (
              <div>
                <a href={record.url} target="_blank" rel="noopener noreferrer">Open original (new tab)</a>
              </div>
            )}
          </div>
        )}
      </section>
    </main>
  )
}
