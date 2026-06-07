import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const allowedMimeTypes = new Set(['application/pdf', 'image/jpeg', 'image/png'])
const maxFileSize = 10 * 1024 * 1024

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function safeFileName(name: string) {
  const cleaned = name
    .normalize('NFKD')
    .replace(/[^\w.\-]+/g, '_')
    .replace(/_+/g, '_')
    .slice(-120)

  return cleaned || 'document'
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (request.method !== 'POST') {
    return jsonResponse({ ok: false, message: 'Method not allowed.' }, 405)
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ ok: false, message: 'Secure upload service is not configured.' }, 500)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const contentType = request.headers.get('content-type') || ''
    let action = ''
    let token = ''
    let documentId = ''
    let file: File | null = null

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      action = String(formData.get('action') || '')
      token = String(formData.get('token') || '')
      documentId = String(formData.get('documentId') || '')
      const candidate = formData.get('file')
      file = candidate instanceof File ? candidate : null
    } else {
      const body = await request.json()
      action = String(body.action || '')
      token = String(body.token || '')
    }

    if (!token || !['validate', 'upload'].includes(action)) {
      return jsonResponse({ ok: false, message: 'Invalid upload request.' }, 400)
    }

    const { data: uploadToken, error: tokenError } = await adminClient
      .from('driver_upload_tokens')
      .select('id, application_id, expires_at, used_at, is_revoked')
      .eq('token', token)
      .maybeSingle()

    const tokenExpired = uploadToken
      ? new Date(uploadToken.expires_at).getTime() <= Date.now()
      : true

    if (tokenError || !uploadToken || uploadToken.is_revoked || tokenExpired) {
      return jsonResponse(
        { ok: false, message: 'This upload link is invalid, expired, or revoked.' },
        403,
      )
    }

    const { data: documents, error: documentsError } = await adminClient
      .from('driver_documents')
      .select('id, document_type, status, file_name')
      .eq('application_id', uploadToken.application_id)
      .order('created_at', { ascending: true })

    if (documentsError) {
      return jsonResponse({ ok: false, message: 'Requested documents could not be loaded.' }, 500)
    }

    if (action === 'validate') {
      const { data: application } = await adminClient
        .from('driver_applications')
        .select('full_name')
        .eq('id', uploadToken.application_id)
        .maybeSingle()

      return jsonResponse({
        ok: true,
        expiresAt: uploadToken.expires_at,
        applicantName: application?.full_name || null,
        documents: documents || [],
      })
    }

    if (!documentId || !file) {
      return jsonResponse({ ok: false, message: 'Choose a document file to upload.' }, 400)
    }

    const document = documents?.find((item) => item.id === documentId)
    if (!document || !['requested', 'rejected', 'expired', 'not_requested'].includes(document.status)) {
      return jsonResponse({ ok: false, message: 'This document is not available for upload.' }, 403)
    }

    if (!allowedMimeTypes.has(file.type)) {
      return jsonResponse({ ok: false, message: 'Upload a PDF, JPG, or PNG file.' }, 400)
    }

    if (file.size > maxFileSize) {
      return jsonResponse({ ok: false, message: 'The file must be 10 MB or smaller.' }, 400)
    }

    const fileName = safeFileName(file.name)
    const storagePath = `${uploadToken.application_id}/${document.document_type}/${Date.now()}_${crypto.randomUUID()}_${fileName}`

    const { error: uploadError } = await adminClient.storage
      .from('driver-documents')
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: false,
      })

    if (uploadError) {
      return jsonResponse({ ok: false, message: 'The document could not be stored securely.' }, 500)
    }

    const { data: updatedDocument, error: updateError } = await adminClient
      .from('driver_documents')
      .update({
        file_path: storagePath,
        file_name: file.name,
        status: 'received',
        updated_at: new Date().toISOString(),
      })
      .eq('id', document.id)
      .eq('application_id', uploadToken.application_id)
      .select('id, document_type, status, file_name')
      .single()

    if (updateError) {
      await adminClient.storage.from('driver-documents').remove([storagePath])
      return jsonResponse({ ok: false, message: 'The document record could not be updated.' }, 500)
    }

    await adminClient
      .from('driver_upload_tokens')
      .update({ used_at: uploadToken.used_at || new Date().toISOString() })
      .eq('id', uploadToken.id)

    return jsonResponse({
      ok: true,
      message: 'Document uploaded successfully.',
      document: updatedDocument,
    })
  } catch {
    return jsonResponse({ ok: false, message: 'The secure upload request could not be completed.' }, 500)
  }
})
