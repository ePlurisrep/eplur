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

  // Attach current user's id to the document; rely on RLS for extra safety.
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    console.error('No authenticated user; cannot save document')
    return null
  }

  const user_id = authData.user.id

  const { data, error } = await supabase
    .from('documents')
    .insert([{ user_id, source, metadata }])
    .select()
    .single()

  if (error) {
    console.error('Error saving document:', error)
    return null
  }

  return data
}

export async function uploadDocument(file: File, title?: string): Promise<Document | null> {
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

  // Upload to supabase storage bucket 'documents'. Bucket should be private.
  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file, { upsert: false, cacheControl: '3600', contentType: file.type })

  if (uploadError) {
    console.error('Upload error:', uploadError)
    return null
  }

  // Save document record
  const metadata = {
    file_path: filePath,
    file_name: file.name,
    file_size: file.size,
    file_type: file.type,
    title: title || null,
    upload_date: new Date().toISOString(),
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
  // Only return documents for the authenticated user
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) return []

  const user_id = authData.user.id

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching documents:', error)
    return []
  }

  return data || []
}

export async function deleteDocument(id: string): Promise<boolean> {
  // Ensure user can only delete their own document
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError || !authData?.user) {
    console.error('No authenticated user; cannot delete document')
    return false
  }

  const user_id = authData.user.id

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', id)
    .eq('user_id', user_id)

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