import { useEffect, useRef, useState } from 'react'
import Head from 'next/head'

export default function ViewSharedGraph({ params }: { params: { shareId: string } }) {
  const { shareId } = params
  const [graph, setGraph] = useState<any | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const cyRef = useRef<any>(null)

  useEffect(() => {
    async function load() {
      const res = await fetch(`/api/graph/saved/${shareId}`)
      const data = await res.json()
      if (res.ok) setGraph(data)
      else setGraph(null)
    }
    load()
  }, [shareId])

  useEffect(() => {
    if (!graph || !containerRef.current) return

    ;(async () => {
      const cytoscape = (await import('cytoscape')).default
      if (cyRef.current) try { cyRef.current.destroy() } catch (e) {}

      const elements = [
        ...graph.config.nodes.map((n: any) => ({ data: { id: n.id, label: n.label } })),
        ...graph.config.edges.map((e: any) => ({ data: { id: `${e.source}-${e.target}`, source: e.source, target: e.target, weight: e.weight } })),
      ]

      const cy = cytoscape({
        container: containerRef.current,
        elements,
        style: [
          { selector: 'node', style: { 'label': 'data(label)', 'background-color': '#0070f3', 'color': '#fff', 'text-valign': 'center', 'text-halign': 'center' } },
          { selector: 'edge', style: { 'width': 2, 'line-color': '#ccc', 'curve-style': 'bezier', 'opacity': 0.8 } },
        ],
        userZoomingEnabled: true,
        userPanningEnabled: true,
        boxSelectionEnabled: false,
        zoomingEnabled: true,
        panningEnabled: true,
      })

      if (cy.elements().length > 0) cy.fit()
      cyRef.current = cy
    })()
  }, [graph])

  if (!graph) return <div>Loading or not found</div>

  return (
    <div>
      <Head>
        <title>{graph.name || 'Shared Graph'} | eplur</title>
      </Head>
      <main className="container">
        <h1>{graph.name || 'Shared Graph'}</h1>
        <p>Read-only shared graph</p>
        <div ref={containerRef} style={{ width: '100%', height: 600, border: '1px solid #ddd' }} />
      </main>
    </div>
  )
}
