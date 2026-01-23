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

export async function getUserNodes(): Promise<GovernmentNode[]> {
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

export async function getUserRelations(): Promise<{ userId?: string; sourceId: string; targetId: string; relation: string }[]> {
  const rows = (await readJson(USER_RELATIONS_PATH)) || []
  return rows.map((r: any) => ({ userId: r.userId, sourceId: r.sourceId, targetId: r.targetId, relation: r.relation }))
}

export default getUserNodes
