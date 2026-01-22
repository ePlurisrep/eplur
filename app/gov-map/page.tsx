import TimeAwareGovMap from '@/app/components/TimeAwareGovMap'
import { fetchCongressData } from '@/lib/fetchCongress'

export default async function GovMapPage() {
  const nodes = await fetchCongressData()

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 12 }}>U.S. Government Structure</h1>

      <section>
        {/* Time-aware client-side map (slider + filtered tree) */}
        <TimeAwareGovMap nodes={nodes} />
      </section>
    </main>
  )
}
