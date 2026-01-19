import { useEffect, useState, useRef } from 'react'
import Head from 'next/head'
import { getUserDocuments } from '../../lib/documents'

type Node = { id: string; label: string }
type Edge = { source: string; target: string; weight: number }

export default function NewGraphPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [selected, setSelected] = useState<Record<string, boolean>>({})
  const [threshold, setThreshold] = useState(0.1)
  const [loading, setLoading] = useState(false)
  const [graph, setGraph] = useState<{ nodes: Node[]; edges: Edge[] } | null>(null)
  const [saveName, setSaveName] = useState('')
  const [savePublic, setSavePublic] = useState(false)
  const [shareLink, setShareLink] = useState<string | null>(null)
  const cyRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    async function loadDocs() {
      const docs = await getUserDocuments()
      setDocuments(docs)
    }
    loadDocs()
  }, [])

  const toggleSelect = (id: string) => {
    setSelected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  const handleGenerate = async () => {
    const ids = Object.keys(selected).filter(id => selected[id])
    if (ids.length === 0) return
    setLoading(true)
    setGraph(null)
    try {
      const res = await fetch('/api/graph', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ documentIds: ids, threshold }),
      })
      const data = await res.json()
      if (res.ok && data.graph) {
        setGraph(data.graph)
      } else {
        alert(data.error || 'Failed to generate graph')
      }
    } catch (err) {
      console.error(err)
      alert('Error generating graph')
    } finally {
      setLoading(false)
    }
  }

  // Initialize Cytoscape when graph changes
  useEffect(() => {
    let mounted = true
    if (!graph || !containerRef.current) return

    ;(async () => {
      const cytoscape = (await import('cytoscape')).default

      if (!mounted) return

      // destroy previous instance
      if (cyRef.current) {
        try { cyRef.current.destroy() } catch (e) {}
      }

      const elements = [
        ...graph.nodes.map(n => ({ data: { id: n.id, label: n.label } })),
        ...graph.edges.map(e => ({ data: { id: `${e.source}-${e.target}`, source: e.source, target: e.target, weight: e.weight } })),
      ]

      const cy = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          { selector: 'node', style: { 'label': 'data(label)', 'background-color': '#0070f3', 'color': '#fff', 'text-valign': 'center', 'text-halign': 'center' } },
          { selector: 'edge', style: { 'width': 2, 'line-color': '#ccc', 'curve-style': 'bezier', 'opacity': 0.8 } },
          { selector: '.highlight', style: { 'background-color': '#ff4081', 'line-color': '#ff4081' } },
        ],
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
      })

      // hover highlight
      cy.on('mouseover', 'node', (evt: any) => {
        const node = evt.target
        node.addClass('highlight')
        node.connectedEdges().addClass('highlight')
        node.connectedNodes().addClass('highlight')
      })
      cy.on('mouseout', 'node', (evt: any) => {
        const node = evt.target
        node.removeClass('highlight')
        node.connectedEdges().removeClass('highlight')
        node.connectedNodes().removeClass('highlight')
      })

      // fit to elements
      if (cy.elements().length > 0) cy.fit()

      cyRef.current = cy
    })()

    return () => { mounted = false; if (cyRef.current) try { cyRef.current.destroy() } catch(e) {} }
  }, [graph])

  return (
    <div>
      <Head>
        <title>New Graph | eplur</title>
      </Head>
      <main className="container">
        <h1>Generate Document Similarity Graph</h1>

        <section>
          <h2>Select Documents</h2>
          <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid #eee', padding: 8 }}>
            {documents.map(d => (
              <label key={d.id} style={{ display: 'block', padding: '6px 4px' }}>
                <input type="checkbox" checked={!!selected[d.id]} onChange={() => toggleSelect(d.id)} />
                {' '}{d.metadata?.title || d.metadata?.file_name || d.id}
                <small style={{ marginLeft: 8, color: '#666' }}> {new Date(d.created_at).toLocaleDateString()}</small>
              </label>
            ))}
          </div>
        </section>

        <section style={{ marginTop: 16 }}>
          <label>
            Similarity threshold: {threshold.toFixed(2)}
            <input type="range" min={0} max={1} step={0.01} value={threshold} onChange={(e) => setThreshold(Number(e.target.value))} />
          </label>
        </section>

        <div style={{ marginTop: 12 }}>
          <button onClick={handleGenerate} disabled={loading || Object.values(selected).filter(Boolean).length === 0}>
            {loading ? 'Generating…' : 'Generate Graph'}
          </button>
          <button
            onClick={() => {
              // export PNG
              const cy = cyRef.current
              if (!cy) return
              const png = cy.png({ full: true })
              const a = document.createElement('a')
              a.href = png
              a.download = 'graph.png'
              a.click()
            }}
            style={{ marginLeft: 8 }}
            disabled={!graph}
          >
            Export PNG
          </button>
          <button
            onClick={() => {
              const cy = cyRef.current
              if (!cy) return
              const svg = cy.svg({ full: true })
              const blob = new Blob([svg], { type: 'image/svg+xml' })
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = 'graph.svg'
              a.click()
              URL.revokeObjectURL(url)
            }}
            style={{ marginLeft: 8 }}
            disabled={!graph}
          >
            Export SVG
          </button>
        </div>

        <section style={{ marginTop: 16 }}>
          <h3>Save / Share</h3>
          <input placeholder="Name (optional)" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
          <label style={{ marginLeft: 8 }}>
            <input type="checkbox" checked={savePublic} onChange={(e) => setSavePublic(e.target.checked)} /> Public (opt-in)
          </label>
          <button
            onClick={async () => {
              if (!graph) return
              const body = { name: saveName, config: graph, public: savePublic }
              const res = await fetch('/api/graph/saved', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
              const data = await res.json()
              if (res.ok) {
                if (data.share_id) {
                  setShareLink(`${window.location.origin}/graphs/view/${data.share_id}`)
                } else {
                  setShareLink(null)
                  alert('Graph saved')
                }
              } else {
                alert(data.error || 'Save failed')
              }
            }}
            disabled={!graph}
            style={{ marginLeft: 8 }}
          >
            Save Graph
          </button>
          {shareLink && (
            <div style={{ marginTop: 8 }}>
              <p>Share link (read-only): <a href={shareLink}>{shareLink}</a></p>
            </div>
          )}
        </section>

        <section style={{ marginTop: 20 }}>
          <h2>Graph</h2>
          {!graph && <p>No graph yet.</p>}
          <div ref={containerRef} style={{ width: '100%', height: 600, border: '1px solid #ddd' }} />
        </section>
      </main>
    </div>
  )
}
