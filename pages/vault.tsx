import { useState, useEffect } from 'react'
import { Document, getUserDocuments, deleteDocument, uploadDocument } from '../lib/documents'
import Head from 'next/head'

export default function Vault() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [sourceFilter, setSourceFilter] = useState<'all' | 'gov' | 'upload'>('all')
  const [dateFilter, setDateFilter] = useState('')
  const [uploadTitle, setUploadTitle] = useState('')
  const [dragActive, setDragActive] = useState(false)

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
        <title>{`Vault | eplur`}</title>
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

        <div className="upload-section">
          <label>
            Title (optional):
            <input
              type="text"
              value={uploadTitle}
              onChange={(e) => setUploadTitle(e.target.value)}
              placeholder="Optional title for this document"
            />
          </label>

          <div
            className={`dropzone ${dragActive ? 'active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragActive(true)
            }}
            onDragLeave={(e) => {
              e.preventDefault()
              setDragActive(false)
            }}
            onDrop={async (e) => {
              e.preventDefault()
              setDragActive(false)
              const file = e.dataTransfer?.files?.[0]
              if (!file) return
              if (isAtLimit) return
              const allowed = ['application/pdf', 'text/plain']
              const extAllowed = ['.pdf', '.txt']
              const lowerName = file.name.toLowerCase()
              if (!allowed.includes(file.type) && !extAllowed.some(ext => lowerName.endsWith(ext))) {
                alert('Only PDF and TXT files are allowed')
                return
              }
              // @ts-ignore File from drop
              const uploaded = await uploadDocument(file, uploadTitle || undefined)
              if (uploaded) {
                setDocuments([uploaded, ...documents])
                setUploadTitle('')
              }
            }}
          >
            <p>Drag & drop PDF or TXT here, or</p>
            <label className="file-input-label">
              <input
                type="file"
                accept=".pdf,.txt,application/pdf,text/plain"
                onChange={async (e) => {
                  const file = e.target.files?.[0]
                  if (!file) return
                  if (isAtLimit) return
                  const uploaded = await uploadDocument(file, uploadTitle || undefined)
                  if (uploaded) {
                    setDocuments([uploaded, ...documents])
                    setUploadTitle('')
                  }
                }}
                disabled={isAtLimit}
              />
              <button disabled={isAtLimit}>Choose file</button>
            </label>
          </div>
        </div>

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

// Document operations are provided by `lib/documents`