import { fetchRecord } from '@/lib/fetchRecord'
import Link from 'next/link'

export default async function RecordPage({
  params,
}: {
  params: { id: string }
}) {
  const record = await fetchRecord(params.id)

  if (!record) {
    return <p>Record not found.</p>
  }

  return (
    <main
      style={{
        padding: '24px',
        fontFamily: 'Georgia, serif',
        maxWidth: 920,
      }}
    >
      <header
        style={{
          borderBottom: '2px solid #002868',
          marginBottom: 24,
        }}
      >
        <h1 style={{ margin: 0 }}>{record.title}</h1>

        <p style={{ fontSize: 14, color: '#444' }}>
          {record.agency} — {record.jurisdiction}
        </p>
      </header>

      <section style={{ marginBottom: 24 }}>
        <strong>Summary</strong>
        <p>{record.summary ?? 'No summary available.'}</p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <strong>Source</strong>
        <p>
          <a href={record.url} target="_blank">
            {record.url ?? record.source ?? 'Open source'}
          </a>
        </p>
      </section>

      <section style={{ marginBottom: 24 }}>
        <strong>GOVERNANCE CONTEXT</strong>
        <div style={{ marginTop: 8 }}>
          {record.links && record.links.length > 0 ? (
            <ul>
              {record.links.map((l) => {
                const year = l.startDate ? new Date(l.startDate).getFullYear() : record.date ? new Date(record.date).getFullYear() : undefined
                return (
                  <li key={`${l.recordId}-${l.nodeId}`}>
                    <a href={`/government?year=${year ?? ''}&node=${encodeURIComponent(l.nodeId)}`}>
                      {l.relevanceType} — {l.nodeId} {year ? `(${year})` : ''}
                    </a>
                  </li>
                )
              })}
            </ul>
          ) : (
            <div style={{ color: '#666' }}>No governance links available for this record.</div>
          )}
        </div>
      </section>

      <section>
        <strong>Metadata</strong>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 14,
          }}
        >
          <tbody>
            <Row label="Record ID" value={record.id} />
            <Row label="Record Type" value={record.recordType} />
            <Row label="Published" value={record.date} />
          </tbody>
        </table>
      </section>

      <footer style={{ marginTop: 32 }}>
        <Link href="/search">← Back to search</Link>
      </footer>
    </main>
  )
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <tr>
      <td style={{ padding: 6, fontWeight: 'bold' }}>{label}</td>
      <td style={{ padding: 6 }}>{value ?? '—'}</td>
    </tr>
  )
}
