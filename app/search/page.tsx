import React from 'react'
import SearchFilters from '@/components/SearchFilters'
import SearchClient from '@/components/SearchClient'

export const metadata = {
  title: 'Search — ePluris',
}

export default function SearchPage() {
  return (
    <main
      style={{
        display: 'grid',
        gridTemplateColumns: '260px 1fr',
        gap: 24,
        padding: '24px',
      }}
    >
      <aside>
        <React.Suspense fallback={<div>Loading filters…</div>}>
          <SearchFilters />
        </React.Suspense>
      </aside>

      <section>
        <React.Suspense fallback={<div>Loading search…</div>}>
          <SearchClient />
        </React.Suspense>
      </section>
    </main>
  )
}

