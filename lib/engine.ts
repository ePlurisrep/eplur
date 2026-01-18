import { supabase } from './supabase'

// Simple TF-IDF implementation for MVP
interface DocumentVector {
  id: string
  vector: Map<string, number>
  magnitude: number
}

interface Node {
  id: string
  label: string
}

interface Edge {
  source: string
  target: string
  weight: number
}

interface Graph {
  nodes: Node[]
  edges: Edge[]
}

// Compute TF-IDF vectors for documents
async function computeTFIDFVectors(documentIds: string[]): Promise<DocumentVector[]> {
  // Get document texts
  const { data: docs, error } = await supabase
    .from('document_text')
    .select('document_id, content')
    .in('document_id', documentIds)
    .not('content', 'is', null)

  if (error || !docs) {
    console.error('Error fetching documents:', error)
    return []
  }

  // Build vocabulary and document frequency
  const vocab = new Map<string, number>() // term -> doc frequency
  const docVectors: Map<string, Map<string, number>> = new Map() // docId -> term -> tf

  docs.forEach(doc => {
    const terms = tokenize(doc.content)
    const termFreq = new Map<string, number>()

    terms.forEach(term => {
      termFreq.set(term, (termFreq.get(term) || 0) + 1)
    })

    docVectors.set(doc.document_id, termFreq)

    // Update vocab
    termFreq.forEach((_, term) => {
      vocab.set(term, (vocab.get(term) || 0) + 1)
    })
  })

  // Compute TF-IDF vectors
  const vectors: DocumentVector[] = []
  const numDocs = docs.length

  docVectors.forEach((termFreq, docId) => {
    const vector = new Map<string, number>()
    let magnitude = 0

    termFreq.forEach((tf, term) => {
      const df = vocab.get(term) || 1
      const idf = Math.log(numDocs / df)
      const tfidf = tf * idf
      vector.set(term, tfidf)
      magnitude += tfidf * tfidf
    })

    vectors.push({
      id: docId,
      vector,
      magnitude: Math.sqrt(magnitude)
    })
  })

  return vectors
}

// Simple tokenization (lowercase, remove punctuation, split)
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2) // Remove short words
}

// Cosine similarity between two vectors
function cosineSimilarity(vec1: DocumentVector, vec2: DocumentVector): number {
  let dotProduct = 0
  vec1.vector.forEach((weight1, term) => {
    const weight2 = vec2.vector.get(term) || 0
    dotProduct += weight1 * weight2
  })

  if (vec1.magnitude === 0 || vec2.magnitude === 0) return 0

  return dotProduct / (vec1.magnitude * vec2.magnitude)
}

// Generate similarity graph
export async function generateSimilarityGraph(
  documentIds: string[],
  threshold: number = 0.1
): Promise<Graph> {
  const vectors = await computeTFIDFVectors(documentIds)

  if (vectors.length === 0) {
    return { nodes: [], edges: [] }
  }

  // Create nodes
  const nodes: Node[] = vectors.map(vec => ({
    id: vec.id,
    label: `Doc ${vec.id.slice(0, 8)}` // Short label
  }))

  // Create edges
  const edges: Edge[] = []

  for (let i = 0; i < vectors.length; i++) {
    for (let j = i + 1; j < vectors.length; j++) {
      const similarity = cosineSimilarity(vectors[i], vectors[j])
      
      if (similarity >= threshold) {
        edges.push({
          source: vectors[i].id,
          target: vectors[j].id,
          weight: similarity
        })
      }
    }
  }

  return { nodes, edges }
}