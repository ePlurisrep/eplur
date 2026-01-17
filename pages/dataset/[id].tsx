import { GetServerSideProps } from 'next'
import { SearchResult } from '../../lib/search/search'
import { searchAll } from '../../lib/search/searchAll'
import Head from 'next/head'

// This would need to be implemented - perhaps a function to get dataset by ID
// For now, we'll simulate with search results
async function getDatasetById(id: string): Promise<SearchResult | null> {
  // In a real implementation, this would fetch from a database or API
  // For demo, we'll search with first few words of title and find by title match
  const title = decodeURIComponent(id).trim()
  const query = title.split(' ').slice(0, 2).join(' ') // Use first 2 words for search
  const results = await searchAll(query)
  return results.find(r => 
    r.title.toLowerCase().includes(title.toLowerCase()) || 
    title.toLowerCase().includes(r.title.toLowerCase())
  ) || null
}

interface DatasetPageProps {
  dataset: SearchResult | null
}

export const getServerSideProps: GetServerSideProps<DatasetPageProps> = async ({ params }) => {
  const id = params?.id as string
  const dataset = await getDatasetById(id)

  // Ensure undefined values are converted to null for JSON serialization
  if (dataset) {
    dataset.description = dataset.description || null;
  }

  return {
    props: {
      dataset,
    },
  }
}

export default function DatasetPage({ dataset }: DatasetPageProps) {
  if (!dataset) {
    return (
      <div>
        <Head>
          <title>Dataset Not Found | eplur</title>
        </Head>
        <main className="container">
          <h1>Dataset Not Found</h1>
          <p>The requested dataset could not be found.</p>
        </main>
      </div>
    )
  }

  return (
    <div>
      <Head>
        <title>{dataset.title} | eplur</title>
        <meta name="description" content={dataset.description || `Dataset from ${dataset.agency}`} />
        <meta property="og:title" content={dataset.title} />
        <meta property="og:description" content={dataset.description ?? undefined} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={dataset.title} />
        <meta name="twitter:description" content={dataset.description ?? undefined} />
      </Head>
      <main className="container">
        <article className="dataset-page">
          <header>
            <h1>{dataset.title}</h1>
            <div className="meta">
              <span className="agency">Agency: {dataset.agency}</span>
              {dataset.date && (
                <span className="date">
                  Last modified: {new Date(dataset.date).toLocaleDateString()}
                </span>
              )}
              <span className={`source-badge ${dataset.source}`}>
                {dataset.source}
              </span>
            </div>
          </header>

          {dataset.description && (
            <section className="description">
              <h2>Description</h2>
              <p>{dataset.description}</p>
            </section>
          )}

          <section className="actions">
            <a
              href={dataset.url}
              target="_blank"
              rel="noopener noreferrer"
              className="official-link"
            >
              View on Official Site
            </a>
            <button className="save-button">
              Save to Vault
            </button>
          </section>
        </article>
      </main>
    </div>
  )
}