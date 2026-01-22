#!/usr/bin/env node
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')
const COMMITTEE_SEED = path.join(ROOT, 'lib', 'government', 'committeeSeed.ts')
const OUTPUT = path.join(ROOT, 'lib', 'government', 'memberSeed.ts')

async function readBioguideIds() {
  const txt = await fs.readFile(COMMITTEE_SEED, 'utf8')
  const re = /bioguideId:\s*'([A-Za-z0-9]+)'/g
  const ids = new Set<string>()
  let m
  // eslint-disable-next-line no-cond-assign
  while ((m = re.exec(txt)) !== null) ids.add(m[1])
  return Array.from(ids)
}

async function fetchMember(id: string, apiKey?: string) {
  if (!apiKey) return { bioguideId: id, name: null, party: null }
  try {
    const res = await fetch(`https://api.propublica.org/congress/v1/members/${id}.json`, {
      headers: { 'X-API-Key': apiKey },
    })
    if (!res.ok) return { bioguideId: id, name: null, party: null }
    const json = await res.json()
    const r = json.results && json.results[0]
    const name = r ? `${r.first_name || ''} ${r.last_name || ''}`.trim() : null
    const party = r ? r.current_party || null : null
    return { bioguideId: id, name, party }
  } catch (e) {
    return { bioguideId: id, name: null, party: null }
  }
}

function makeFile(members: Array<{bioguideId:string,name:string|null,party:string|null}>) {
  const lines = members.map(m => `  { bioguideId: '${m.bioguideId}', name: ${m.name===null? 'null': JSON.stringify(m.name)}, party: ${m.party===null? 'null': JSON.stringify(m.party)} },`)
  return `// GENERATED FILE - DO NOT EDIT MANUALLY\n// Run scripts/enrich_members.ts to regenerate\nexport const MEMBER_SEED = [\n${lines.join('\n')}\n]\n\nexport default MEMBER_SEED\n`
}

async function main() {
  const ids = await readBioguideIds()
  if (ids.length === 0) {
    console.log('No bioguideIds found in', COMMITTEE_SEED)
    return
  }
  const apiKey = process.env.CONGRESS_API_KEY
  console.log('Found', ids.length, 'unique bioguideIds. Using ProPublica API:', !!apiKey)
  const members: Array<{bioguideId:string,name:string|null,party:string|null}> = []
  for (const id of ids) {
    process.stdout.write(`Fetching ${id} ... `)
    // polite rate limit
    const m = await fetchMember(id, apiKey)
    console.log(m.name ?? 'unknown', m.party ?? '')
    members.push(m)
    await new Promise(r => setTimeout(r, 200))
  }
  const out = makeFile(members)
  await fs.writeFile(OUTPUT, out, 'utf8')
  console.log('Wrote', OUTPUT)
}

// If this file is executed directly, run main(). Use an ESM-safe check.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch(err => {
    console.error(err)
    process.exit(1)
  })
}
