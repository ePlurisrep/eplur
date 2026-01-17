import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Document } from '../lib/documents'
import Head from 'next/head'

export default function Vault() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [sourceFilter, setSourceFilter] = useState<'all' | 'gov' | 'upload'>('all')
  const [dateFilter, setDateFilter] = useState('')

  useEffect(() => {
    fetchDocuments()
  }, [])

  useEffect(() => {
    filterDocuments()
  }, [documents, sourceFilter, dateFilter])

  const fetchDocuments = async () => {
    const docs = await getUserDocuments()
    setDocuments(docs)
    setLoading(false)
  }

  const filterDocuments = () => {
    let filtered = documents

    if (sourceFilter !== 'all') {
      filtered = filtered.filter(doc => doc.source === sourceFilter)
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter)
      filtered = filtered.filter(doc => new Date(doc.created_at) >= filterDate)
    }

    setFilteredDocuments(filtered)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteDocument(id)
    if (success) {
      setDocuments(documents.filter(doc => doc.id !== id))
    }
  }

  const documentCount = documents.length
  const isAtLimit = documentCount >= 10

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <Head>
        <title>Vault | eplur</title>
      </Head>
      <main className="container">
        <h1>Your Document Vault</h1>
        <p>You have {documentCount} documents saved.</p>

        {isAtLimit && (
          <div className="upgrade-cta">
            <p>You've reached the free tier limit of 10 documents.</p>
            <button>Upgrade to Pro</button>
          </div>
        )}

        <div className="filters">
          <label>
            Source:
            <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value as any)}>
              <option value="all">All</option>
              <option value="gov">Government</option>
              <option value="upload">Uploaded</option>
            </select>
          </label>

          <label>
            From Date:
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </label>
        </div>

        <div className="documents-list">
          {filteredDocuments.length === 0 ? (
            <p>No documents found.</p>
          ) : (
            filteredDocuments.map((doc) => (
              <div key={doc.id} className="document-item">
                <h3>{doc.metadata.title || 'Untitled'}</h3>
                <p>Source: {doc.source}</p>
                <p>Created: {new Date(doc.created_at).toLocaleDateString()}</p>
                {doc.metadata.description && <p>{doc.metadata.description}</p>}
                <button onClick={() => handleDelete(doc.id)}>Delete</button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}

// These functions should be imported, but for now inline
async function getUserDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }

  return data || []
}

async function deleteDocument(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting document:', error)
    return false
  }

  return true
}