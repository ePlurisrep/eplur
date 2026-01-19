import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

type CacheEntry = {
  value: any
  expiresAt: number
}

const memoryCache: Map<string, CacheEntry> = new Map()
const CACHE_DIR = path.resolve(process.cwd(), '.cache', 'adapters')

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true })
}

function hashKey(key: string) {
  return crypto.createHash('sha1').update(key).digest('hex')
}

export async function getCached(key: string): Promise<any | null> {
  const now = Date.now()
  const h = hashKey(key)

  const mem = memoryCache.get(h)
  if (mem) {
    if (mem.expiresAt > now) return mem.value
    memoryCache.delete(h)
  }

  try {
    const file = path.join(CACHE_DIR, `${h}.json`)
    if (fs.existsSync(file)) {
      const raw = await fs.promises.readFile(file, 'utf8')
      const parsed: CacheEntry = JSON.parse(raw)
      if (parsed.expiresAt > now) {
        memoryCache.set(h, parsed)
        return parsed.value
      } else {
        // expired on disk
        await fs.promises.unlink(file).catch(() => {})
        memoryCache.delete(h)
      }
    }
  } catch (err) {
    // ignore cache errors
    console.warn('Cache read error', err)
  }

  return null
}

export async function setCached(key: string, value: any, ttlSeconds: number = 3600) {
  const now = Date.now()
  const expiresAt = now + ttlSeconds * 1000
  const entry: CacheEntry = { value, expiresAt }
  const h = hashKey(key)

  memoryCache.set(h, entry)

  try {
    ensureDir()
    const file = path.join(CACHE_DIR, `${h}.json`)
    await fs.promises.writeFile(file, JSON.stringify(entry), 'utf8')
  } catch (err) {
    console.warn('Cache write error', err)
  }
}

export async function clearCache(prefix?: string) {
  // optional: clear cache entries that match prefix
  try {
    ensureDir()
    const files = await fs.promises.readdir(CACHE_DIR)
    for (const f of files) {
      if (!prefix) {
        await fs.promises.unlink(path.join(CACHE_DIR, f)).catch(() => {})
      } else {
        // can't map prefix to hash easily; skip
      }
    }
    memoryCache.clear()
  } catch (err) {
    // ignore
  }
}

export default { getCached, setCached, clearCache }
