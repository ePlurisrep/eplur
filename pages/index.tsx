import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

type SearchResult = {
  title: string
  agency?: string
  date?: string | null
  source: 'data.gov' | 'govinfo' | 'census'
  url: string
  description?: string
}

export default function Home() {
  const router = useRouter()
  const { q } = router.query

  const searchQuery = typeof q === 'string' ? q : ''

  const [input, setInput] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    if (router && typeof router.push === 'function') {
      router.push(`/?q=${encodeURIComponent(input)}`)
    }
  }

  useEffect(() => {
    if (!searchQuery) return

    setLoading(true)

    fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then((res) => res.json())
      .then(setResults)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [searchQuery])

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">
        Search U.S. Government Data
      </h1>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Try: inflation, housing, payroll..."
          className="flex-1 border px-3 py-2 rounded"
        />
        <button className="bg-black text-white px-4 rounded">
          Search
        </button>
      </form>

      {loading && (
        <p className="mt-6 text-gray-500">
          Searching government sources…
        </p>
      )}

      {!loading && searchQuery && results.length === 0 && (
        <p className="mt-6 text-gray-500">
          No results found for “{searchQuery}”
        </p>
      )}

      <ul className="mt-6 space-y-4">
        {results.map((r, i) => (
          <li
            key={i}
            className="border rounded p-4 hover:bg-gray-50"
          >
            <a
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="text-lg font-semibold text-blue-700"
            >
              {r.title}
            </a>

            <p className="text-sm text-gray-600 mt-1">
              {r.agency || 'U.S. Government'} · {r.source}
              {r.date ? ` · ${r.date}` : ''}
            </p>

            {r.description && (
              <p className="mt-2 text-gray-700">
                {r.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </main>
  )
}
