import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
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
    console.error('Document download function is missing required server secrets.')
    return jsonResponse({ ok: false, message: 'Secure document access is not configured.' }, 500)
  }

  const authorization = request.headers.get('authorization')
  const jwt = authorization?.startsWith('Bearer ') ? authorization.slice(7) : null

  if (!jwt) {
    return jsonResponse({ ok: false, message: 'Admin authentication is required.' }, 401)
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  try {
    const { data: userData, error: userError } = await adminClient.auth.getUser(jwt)
    if (userError || !userData.user) {
      console.error('Document download authentication failed:', userError)
      return jsonResponse({ ok: false, message: 'Admin authentication is required.' }, 401)
    }

    const { data: adminProfile, error: profileError } = await adminClient
      .from('admin_profiles')
      .select('id')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (profileError || !adminProfile) {
      console.error('Document download authorization failed:', {
        userId: userData.user.id,
        error: profileError,
      })
      return jsonResponse({ ok: false, message: 'Authorized admin access is required.' }, 403)
    }

    const body = await request.json()
    const documentId = String(body.documentId || '')

    if (!documentId) {
      return jsonResponse({ ok: false, message: 'Document ID is required.' }, 400)
    }

    const { data: document, error: documentError } = await adminClient
      .from('driver_documents')
      .select('id, document_type, file_path, file_name')
      .eq('id', documentId)
      .maybeSingle()

    if (documentError || !document) {
      console.error('Document download record lookup failed:', {
        documentId,
        error: documentError,
      })
      return jsonResponse({ ok: false, message: 'The uploaded document could not be found.' }, 404)
    }

    if (!document.file_path) {
      return jsonResponse({ ok: false, message: 'No uploaded file is available for this document.' }, 400)
    }

    const { data: signedUrlData, error: signedUrlError } = await adminClient.storage
      .from('driver-documents')
      .createSignedUrl(document.file_path, 300)

    if (signedUrlError || !signedUrlData?.signedUrl) {
      console.error('Document signed URL generation failed:', {
        documentId,
        error: signedUrlError,
      })
      return jsonResponse({ ok: false, message: 'The document could not be opened securely.' }, 500)
    }

    return jsonResponse({
      ok: true,
      signedUrl: signedUrlData.signedUrl,
      fileName: document.file_name || 'driver-document',
      documentType: document.document_type,
    })
  } catch (error) {
    console.error('Unexpected document download failure:', error)
    return jsonResponse({ ok: false, message: 'The document could not be opened securely.' }, 500)
  }
})
