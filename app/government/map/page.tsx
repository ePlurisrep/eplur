import GovernmentMap from '@/components/GovernmentMap'
import GOVERNMENT_ENTITIES from '@/lib/government/entities'

export const metadata = {
  title: 'Government Map — ePluris',
}

export default async function GovernmentMapPage() {
  // Prefer server-side canonical API; fallback to local scaffold if unavailable.
  let entities = GOVERNMENT_ENTITIES

  try {
    const base = process.env.NEXT_PUBLIC_BASE_URL || ''
    if (base) {
      const res = await fetch(`${base}/api/government/entities`, { cache: 'no-store' })
      if (res.ok) {
        const json = await res.json()
        entities = json.entities || entities
      }
    }
  } catch (e) {
    // fall back to local scaffold
  }

  return (
    <main style={{ padding: 24, maxWidth: 1200 }}>
      <h1 style={{ fontFamily: 'serif' }}>Government Map</h1>
      <p style={{ maxWidth: 800 }}>
        An interactive structural map of the United States government. Click a
        branch to expand and explore committees, members, and agencies.
      </p>

      <section style={{ marginTop: 18 }}>
        <GovernmentMap entities={entities} />
      </section>
    </main>
  )
}
