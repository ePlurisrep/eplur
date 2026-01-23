import { NextResponse } from 'next/server'
import { fetchCongressData, fetchCongressRelations } from '@/lib/fetchCongress'
import { getUserNodes, getUserRelations } from '@/lib/userNodes'
import type { GraphNode, GraphEdge, NodeType, RelationshipType } from '@/types/graph'

export async function GET(req: Request) {
  try {
    const nodesRaw = await fetchCongressData()
    const relations = await fetchCongressRelations()

    const nodes: GraphNode[] = nodesRaw.map((n) => ({
      id: n.id,
      label: n.name,
      type: (n.type as unknown as NodeType) || ('member' as NodeType),
      group: (n.branch ?? n.type) as string,
      description: (n.description as string) || undefined,
      metadata: {
        startDate: n.startDate ?? null,
        endDate: n.endDate ?? null,
        ...(n.metadata || {}),
      },
    }))

    // merge optional user nodes (if Prisma configured)
    const userNodes = await getUserNodes()
    const userRelations = await getUserRelations()
    const query = new URL(req.url).searchParams
    const requestedUser = query.get('user')

    const seen = new Set(nodes.map((n) => n.id))

    // If a specific user is requested, namespace their nodes and edges.
    let userNodeIdMap: Record<string, string> = {}
    if (requestedUser) {
      const usersNodesForUser = userNodes.filter((u) => (u.sources as any)?.ownerId === requestedUser)
      for (const u of usersNodesForUser) {
        if (!seen.has(`user:${requestedUser}:node:${u.id}`)) {
          const namespaced = `user:${requestedUser}:node:${u.id}`
          nodes.push({
            id: namespaced,
            label: u.name,
            type: (u.type as unknown as NodeType) || ('user_node' as NodeType),
            group: (u.type as string) || 'user_node',
            description: undefined,
            metadata: u.metadata || {},
          })
          seen.add(namespaced)
          userNodeIdMap[u.id] = namespaced
        }
      }
    } else {
      // no user requested: include all user nodes as-is (namespaced by their owner)
      for (const u of userNodes) {
        const owner = (u.sources as any)?.ownerId || 'unknown'
        const namespaced = `user:${owner}:node:${u.id}`
        if (!seen.has(namespaced)) {
          nodes.push({
            id: namespaced,
            label: u.name,
            type: (u.type as unknown as NodeType) || ('user_node' as NodeType),
            group: (u.type as string) || 'user_node',
            description: undefined,
            metadata: u.metadata || {},
          })
          seen.add(namespaced)
          userNodeIdMap[u.id] = namespaced
        }
      }
    }

    // build edges from both derived relations and persisted user relations
    // parent-child edges (CONTAINS)
    const edges: GraphEdge[] = []
    for (const n of nodesRaw) {
      if (n.parentId) {
        edges.push({ source: n.parentId, target: n.id, relationship: 'CONTAINS' as RelationshipType, weight: 1, metadata: {} })
      }
    }

    // derived relations mapping
    const mapRel = (t: string) => {
      switch (t) {
        case 'serves_on':
        case 'member_of':
          return 'MEMBER_OF'
        case 'chairs':
          return 'OVERSEES'
        case 'sponsored_by':
          return 'SPONSORED'
        case 'referred_to':
          return 'RELATED_TO'
        default:
          return ('USER_DEFINED' as RelationshipType)
      }
    }

    for (const r of relations) {
      edges.push({
        source: r.fromId,
        target: r.toId,
        relationship: mapRel(r.type),
        weight: 1,
        metadata: { startDate: r.startDate ?? null, endDate: r.endDate ?? null },
      })
    }

    // Merge user relations, resolving source/target to namespaced IDs when they refer to user nodes.
    for (const ur of userRelations) {
      // if user relation belongs to a different user and a specific user was requested, skip
      if (requestedUser && ur.userId && ur.userId !== requestedUser) continue

      const resolve = (id: string) => userNodeIdMap[id] ?? id

      edges.push({ source: resolve(ur.sourceId), target: resolve(ur.targetId), relationship: (ur.relation as RelationshipType) || 'USER_DEFINED', weight: 1, metadata: {} })
    }

    return NextResponse.json({ nodes, edges }, { headers: { 'Cache-Control': 'public, s-maxage=3600' } })
  } catch (e) {
    return NextResponse.json({ error: 'failed to build graph', details: String(e) }, { status: 500 })
  }
}

// Graph export runs in the Node runtime to allow optional file-backed user data
