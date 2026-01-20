import SearchClient from '@/components/SearchClient'

export const metadata = {
  title: 'Search — ePluris',
}

export default function SearchPage() {
  return (
    <main>
      <h1 style={{ padding: '16px 24px', margin: 0 }}>
        Search
      </h1>

      <section style={{ padding: '12px 24px' }}>
        <SearchClient />
      </section>
    </main>
  )
}

