import { getRecordById } from '@/lib/records'
import RecordIframe from '@/components/RecordIframe'
import SaveToVault from '@/components/SaveToVault'

type Props = {
  params: { id: string }
}

export default async function RecordPage({ params }: Props) {
  const record = await getRecordById(params.id)

  if (!record) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Record not found</h1>
        <p>No record found for id: {params.id}</p>
      </main>
    )
  }

  return (
    <main className="record-view" style={{ fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, serif' }}>
      <style>{`
        .record-view { background: #f5f5f5; min-height: 100vh; padding: 24px 0; color: #111 }
        .record-container { max-width: 1100px; margin: 0 auto }

        .record-header { background: #002868; color: #fff; padding: 12px 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em }

        /* iframe / embed */
        .record-frame { width: 100%; height: 70vh; border: 1px solid #002868; background: #fff; display: block }

        /* controls */
        .record-controls { display: flex; gap: 1rem; padding: 1rem; background: #bf0a30 }
        .record-controls button,
        .record-controls a.control-btn { background: #fff; color: #002868; border: 1px solid #002868; padding: 0.5rem 1rem; font-weight: 700; cursor: pointer; text-decoration: none; border-radius: 0 }

        /* metadata area: table layout */
        .record-metadata { padding: 1.5rem; background: #fff; border-top: 1px solid #002868 }
        .record-metadata h1 { margin: 0 0 12px 0; font-size: 18px }
        .record-meta-table { width: 100%; border-collapse: collapse; }
        .record-meta-table th { text-align: left; padding: 8px 6px; width: 220px; text-transform: uppercase; font-size: 12px; border-bottom: 1px solid #eee }
        .record-meta-table td { padding: 8px 6px; border-bottom: 1px solid #eee }

        /* typography / visuals */
        .section-title { text-transform: uppercase; font-weight: 700; font-size: 12px; color: #002868; margin-bottom: 8px }
        a { color: #002868 }

        /* no rounded corners or animation */
        * { transition: none !important }
      `}</style>

      <div className="record-container">
        <div className="record-header">ePluris | Public Record Viewer</div>

        <RecordIframe src={record.url} title={record.title} />

        <section className="record-controls">
          <SaveToVault record={{ id: record.id, url: record.url, title: record.title, recordType: record.recordType }} />
          <a className="control-btn" href={`#metadata`}>View Metadata</a>
          <a className="control-btn" href={record.originalUrl} target="_blank" rel="noreferrer">Open Official Source</a>
        </section>

        <section id="metadata" className="record-metadata">
          <div className="section-title">Record</div>
          <h1 style={{ margin: 0 }}>{record.title}</h1>

          <table className="record-meta-table" role="presentation">
            <tbody>
              <tr>
                <th>Record Type</th>
                <td>{record.recordType}</td>
              </tr>
              <tr>
                <th>Date / Range</th>
                <td>{record.date ?? 'Not specified'}</td>
              </tr>
              <tr>
                <th>Jurisdiction</th>
                <td>{record.jurisdiction ?? 'Not specified'}</td>
              </tr>
              <tr>
                <th>Source Agency</th>
                <td>{record.source ?? 'Not specified'}</td>
              </tr>
              <tr>
                <th>Original URL</th>
                <td><a href={record.originalUrl} target="_blank" rel="noreferrer">{record.originalUrl}</a></td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>
    </main>
  )
}
