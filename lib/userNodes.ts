import fs from 'fs/promises'
import path from 'path'
import type { GovernmentNode } from '@/types/government'

const USER_NODES_PATH = path.join(process.cwd(), 'data', 'userNodes.json')
const USER_RELATIONS_PATH = path.join(process.cwd(), 'data', 'userRelations.json')

async function readJson(file: string) {
  try {
    const raw = await fs.readFile(file, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    return null
  }
}

async function fileGetUserNodes(): Promise<GovernmentNode[]> {
  const rows = (await readJson(USER_NODES_PATH)) || []
  return rows.map((r: any) => ({
    id: r.id,
    type: 'userNode',
    name: r.label,
    parentId: undefined,
    metadata: r.metadata ?? {},
    sources: { ownerId: r.userId },
  }))
}

async function fileGetUserRelations(): Promise<{ userId?: string; sourceId: string; targetId: string; relation: string }[]> {
  const rows = (await readJson(USER_RELATIONS_PATH)) || []
  return rows.map((r: any) => ({ userId: r.userId, sourceId: r.sourceId, targetId: r.targetId, relation: r.relation }))
}

// Try to use Prisma if available and configured; otherwise fall back to file-backed store.
export async function getUserNodes(): Promise<GovernmentNode[]> {
  try {
    // dynamic import so code doesn't fail when @prisma/client isn't installed
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mod = await import('@prisma/client')
    const { PrismaClient } = mod
    // reuse a global Prisma client in development to avoid exhausting connections
    const globalAny: any = globalThis
    if (!globalAny.prisma) globalAny.prisma = new PrismaClient()
    const prisma: any = globalAny.prisma

    const rows = await prisma.userNode.findMany()
    const out: GovernmentNode[] = []
    for (const r of rows) {
      let label = r.notes || `User Node ${r.id}`
      try {
        const node = await prisma.node.findUnique({ where: { id: r.nodeId } })
        if (node && node.label) label = node.label
      } catch (_) {
        // ignore lookup errors and fall back to notes
      }
      out.push({
        id: r.id,
        type: 'userNode',
        name: label,
        parentId: undefined,
        metadata: { tags: r.tags || [] },
        sources: { ownerId: r.userId },
      })
    }
    return out
  } catch (e) {
    return fileGetUserNodes()
  }
}

export async function getUserRelations(): Promise<{ userId?: string; sourceId: string; targetId: string; relation: string }[]> {
  // Currently migrations don't include a dedicated user-relations table,
  // so keep the file-backed relations as the source of truth for user-created edges.
  return fileGetUserRelations()
}

export default getUserNodes
