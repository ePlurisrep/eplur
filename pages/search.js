import Home from './index'

export const metadata = {
  title: 'Search U.S. Government Data & Policy',
  description:
    'Search datasets, regulations, and official U.S. government documents from Data.gov, Census, and GovInfo.',
}

export async function getServerSideProps(ctx) {
  const q = ctx.query.q

  if (!q || typeof q !== 'string') {
    return { props: { initialResults: [] } }
  }

  const base = process.env.NEXT_PUBLIC_BASE_URL || ''
  const res = await fetch(`${base}/api/proxy/search?q=${encodeURIComponent(q)}`, {
    headers: {
      cookie: ctx.req.headers.cookie ?? '',
    },
  })

  const data = await res.json().catch(() => [])

  return { props: { initialResults: data } }
}

export default Home
