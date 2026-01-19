// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import pdfParse from 'https://esm.sh/pdf-parse@1.1.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { documentId } = await req.json()

    // Get document
    const { data: document, error: docError } = await supabaseClient
      .from('documents')
      .select('*')
      .eq('id', documentId)
      .single()

    if (docError || !document) {
      throw new Error('Document not found')
    }

    if (document.source !== 'upload') {
      throw new Error('Only uploaded documents can be processed')
    }

    // Assume file path is in metadata.file_path
    const filePath = document.metadata.file_path
    if (!filePath) {
      throw new Error('No file path in metadata')
    }

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabaseClient.storage
      .from('documents')
      .download(filePath)

    if (downloadError) {
      throw new Error('Failed to download file')
    }

    // Extract text
    let content = ''
    const fileExtension = filePath.split('.').pop()?.toLowerCase()

    if (fileExtension === 'pdf') {
      const pdfData = await pdfParse(new Uint8Array(await fileData.arrayBuffer()))
      content = pdfData.text
    } else if (fileExtension === 'txt') {
      content = await fileData.text()
    } else {
      throw new Error('Unsupported file type')
    }

    // Count tokens (simple word count)
    const tokenCount = content.split(/\s+/).length

    // Store extracted text (use upsert to clear previous errors and reset retry_count)
    const { error: upsertError } = await supabaseClient
      .from('document_text')
      .upsert({
        document_id: documentId,
        content,
        token_count: tokenCount,
        extracted_at: new Date().toISOString(),
        error_message: null,
        retry_count: 0,
      })

    if (upsertError) {
      throw new Error('Failed to store extracted text')
    }

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Extraction error:', error)

    // Update document_text with error
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { documentId } = await req.json().catch(() => ({}))

    if (documentId) {
      const { data: existing } = await supabaseClient
        .from('document_text')
        .select('retry_count')
        .eq('document_id', documentId)
        .single()

      const retryCount = (existing?.retry_count || 0) + 1

      await supabaseClient
        .from('document_text')
        .upsert({
          document_id: documentId,
          error_message: error.message,
          retry_count: retryCount
        })
    }

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})