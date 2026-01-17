import { supabase } from './supabase'
import { SearchResult } from './search/search'

export interface Document {
  id: string
  user_id: string
  source: 'gov' | 'upload'
  metadata: Record<string, any>
  created_at: string
}

export async function saveDocument(
  source: 'gov' | 'upload',
  metadata: Record<string, any>
): Promise<Document | null> {
  // Check document count for free tier limit
  const userDocs = await getUserDocuments()
  if (userDocs.length >= 10) {
    console.error('Free tier limit reached: 10 documents')
    return null
  }

  const { data, error } = await supabase
    .from('documents')
    .insert([{ source, metadata }])
    .select()
    .single()

  if (error) {
    console.error('Error saving document:', error)
    return null
  }

  return data
}

export async function uploadDocument(file: File): Promise<Document | null> {
  // Check document count
  const userDocs = await getUserDocuments()
  if (userDocs.length >= 10) {
    console.error('Free tier limit reached')
    return null
  }

  // Upload file to storage
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}.${fileExt}`
  const filePath = `uploads/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file)

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return null
  }

  // Save document record
  const metadata = {
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type
  }

  const doc = await saveDocument('upload', metadata)
  if (!doc) return null

  // Trigger text extraction
  await triggerTextExtraction(doc.id)

  return doc
}

async function triggerTextExtraction(documentId: string) {
  const { data, error } = await supabase.functions.invoke('extract-text', {
    body: { documentId }
  })

  if (error) {
    console.error('Extraction trigger error:', error)
  }
}

export async function getUserDocuments(): Promise<Document[]> {
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

export async function deleteDocument(id: string): Promise<boolean> {
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

// Convert SearchResult to document metadata
export function searchResultToMetadata(result: SearchResult): Record<string, any> {
  return {
    title: result.title,
    agency: result.agency,
    date: result.date,
    source: result.source,
    url: result.url,
    description: result.description,
  }
}