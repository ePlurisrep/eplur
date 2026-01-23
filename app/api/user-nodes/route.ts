import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const USER_NODES_PATH = path.join(process.cwd(), 'data', 'userNodes.json')

async function readJson(file: string) {
  try {
    const raw = await fs.readFile(file, 'utf-8')
    return JSON.parse(raw)
  } catch {
    return []
  }
}

async function writeJson(file: string, data: any) {
  await fs.mkdir(path.dirname(file), { recursive: true })
  await fs.writeFile(file, JSON.stringify(data, null, 2), 'utf-8')
}

export async function POST(req: Request) {
  const body = await req.json()

  const rows = await readJson(USER_NODES_PATH)
  const node = { ...body, id: `user-${crypto.randomUUID()}`, type: 'userNode' }
  rows.push(node)
  await writeJson(USER_NODES_PATH, rows)

  return NextResponse.json(node)
}

// Uses Node runtime for file-backed persistence
