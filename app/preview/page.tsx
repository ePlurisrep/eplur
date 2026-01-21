export const metadata = {
  title: 'Record Preview — ePluris',
}
function isPDF(url: string) {
  return url.toLowerCase().includes('.pdf')
}

import PreviewFrame from '@/components/PreviewFrame'

export default function PreviewPage({ searchParams }: any) {
  const url = searchParams?.url

  if (!url) {
    return <p style={{ padding: 24 }}>No record specified.</p>
  }

  const pdf = isPDF(url)

  return (
    <main style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          padding: '8px 16px',
          background: '#002868',
          color: '#fff',
          fontFamily: 'monospace',
          fontSize: 13,
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <span>RECORD PREVIEW — OFFICIAL SOURCE</span>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#fff', textDecoration: 'underline' }}
        >
          Open Original
        </a>
      </header>

      <div style={{ flex: 1 }}>
        <PreviewFrame url={url} pdf={pdf} />
      </div>
    </main>
  )
}
