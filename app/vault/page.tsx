import VaultClient from '@/components/VaultClient'

export const metadata = {
  title: 'Vault — ePluris',
}

export default function VaultPage() {
  return (
    <main>
      <h1 style={{ padding: '16px 24px', margin: 0 }}>Vault</h1>
      <section style={{ padding: '12px 24px' }}>
        <VaultClient />
      </section>
    </main>
  )
}
