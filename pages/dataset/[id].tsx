import { GetServerSideProps } from 'next'
import { SearchResult } from '../../lib/search/search'
import { searchAll } from '../../lib/search/searchAll'
import Head from 'next/head'

// This would need to be implemented - perhaps a function to get dataset by ID
// For now, we'll simulate with search results
async function getDatasetById(id: string): Promise<SearchResult | null> {
  // MVP fix: Do NOT re-query external APIs
  // Use known metadata or mock for now
  const title = decodeURIComponent(id).trim()
  
  // Mock dataset based on title (replace with real persistence later)
  return {
    title,
    agency: 'Government Agency', // Mock
    date: null, // Mock
    source: 'govinfo', // Mock
    url: `https://example.com/${encodeURIComponent(title)}`, // Mock
    description: `Description for ${title}` // Mock
  }
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
        <title>{`${dataset.title} — U.S. Government Dataset`}</title>
        <meta name="description" content={dataset.description || `Official U.S. government dataset from ${dataset.agency}.`} />
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
              🔗 Official Source ({dataset.source})
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