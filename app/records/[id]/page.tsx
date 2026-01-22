import type { GovernmentNode } from '@/types/government'
import { fetchCongressData } from '@/lib/fetchCongress'
import NodeCard from '@/app/components/NodeCard'
import Breadcrumbs from '@/app/components/Breadcrumbs'

type Props = { params: { id: string } }

export default async function RecordPage({ params }: Props) {
  const nodes = await fetchCongressData()
  const node = nodes.find((n) => n.id === params.id)

  if (!node) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Not found</h1>
        <p>No government node found for id: {params.id}</p>
      </main>
    )
  }

  const crumbs = [{ href: '/government', label: 'Government' }, { label: node.name }]

  return (
    <main style={{ padding: 24, maxWidth: 980 }}>
      <Breadcrumbs parts={crumbs} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 18 }}>
        <div>
          <NodeCard node={node as GovernmentNode} />
          <section style={{ marginTop: 18 }}>
            <h3>Details</h3>
            <div style={{ color: '#333' }}>{node.description ?? 'No description available.'}</div>
            {node.metadata && (
              <div style={{ marginTop: 12 }}>
                <h4 style={{ margin: '0 0 8px 0' }}>Metadata</h4>
                <pre style={{ background: '#f8f8f8', padding: 8 }}>{JSON.stringify(node.metadata, null, 2)}</pre>
              </div>
            )}
          </section>
        </div>

        <aside>
          <h4 style={{ marginTop: 0 }}>Links</h4>
          {node.sources?.url && <a href={node.sources.url} target="_blank" rel="noreferrer">Official Source</a>}
        </aside>
      </div>
    </main>
  )
}
