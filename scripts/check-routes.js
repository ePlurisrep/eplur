const fs = require('fs')
const path = require('path')

const root = process.cwd()

function walk(dir, cb) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  for (const e of entries) {
    const full = path.join(dir, e.name)
    cb(full, e)
    if (e.isDirectory()) walk(full, cb)
  }
}

// Find all 'pages' directories
const pagesDirs = []
walk(root, (p, stat) => {
  if (stat.isDirectory() && path.basename(p) === 'pages') pagesDirs.push(p)
})

if (pagesDirs.length > 1) {
  console.error('Routing lock error: multiple `pages/` directories found:')
  for (const d of pagesDirs) console.error(' -', path.relative(root, d))
  console.error('\nPlease keep only the repository root `pages/` folder (legacy) and move all UI into `app/`.')
  process.exit(1)
}

// Scan for forbidden files anywhere
const forbiddenIndex = []
const forbiddenSearch = []
walk(root, (p, stat) => {
  if (!stat.isFile()) return
  const rel = path.relative(root, p).replace(/\\/g, '/')
  if (/\/pages\/index\.(js|jsx|ts|tsx)$/.test('/' + rel)) forbiddenIndex.push(rel)
  if (/\/pages\/search\.(js|jsx|ts|tsx)$/.test('/' + rel)) forbiddenSearch.push(rel)
})

if (forbiddenIndex.length) {
  console.error('Routing lock error: `pages/index.*` is not allowed. Found:')
  forbiddenIndex.forEach(f => console.error(' -', f))
  process.exit(1)
}

if (forbiddenSearch.length) {
  console.error('Routing lock error: `pages/search.*` is not allowed. Found:')
  forbiddenSearch.forEach(f => console.error(' -', f))
  process.exit(1)
}

// Validate root-level pages contents (if present)
const rootPages = path.join(root, 'pages')
if (fs.existsSync(rootPages)) {
  const allowedTopLevelDirs = new Set(['api', 'dataset', 'vault'])
  const allowedTopLevelFiles = ['_app.js', '_app.jsx', '_app.ts', '_app.tsx']
  const entries = fs.readdirSync(rootPages, { withFileTypes: true })
  const bad = []
  for (const e of entries) {
    if (e.isDirectory()) {
      if (!allowedTopLevelDirs.has(e.name)) bad.push(path.join('pages', e.name))
    } else {
      if (!allowedTopLevelFiles.includes(e.name)) bad.push(path.join('pages', e.name))
    }
  }
  if (bad.length) {
    console.error('Routing lock error: disallowed files/directories found at repository `pages/` root:')
    bad.forEach(b => console.error(' -', b))
    console.error('\nAllowed at root/pages: `api/`, `dataset/`, `vault/`, and `_app.*` only.')
    process.exit(1)
  }
}

console.log('Route lock check passed.')
process.exit(0)
