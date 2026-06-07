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

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
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
  const resendApiKey = Deno.env.get('RESEND_API_KEY')
  const fromEmail = Deno.env.get('DOCUMENT_REQUEST_FROM_EMAIL')

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !fromEmail) {
    console.error('Document request email function is missing required server secrets.')
    return jsonResponse({ ok: false, message: 'Email sending is not configured yet.' }, 500)
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
      console.error('Document request email authentication failed:', userError)
      return jsonResponse({ ok: false, message: 'Admin authentication is required.' }, 401)
    }

    const { data: adminProfile, error: profileError } = await adminClient
      .from('admin_profiles')
      .select('id')
      .eq('user_id', userData.user.id)
      .maybeSingle()

    if (profileError || !adminProfile) {
      console.error('Document request email authorization failed:', {
        userId: userData.user.id,
        error: profileError,
      })
      return jsonResponse({ ok: false, message: 'Authorized admin access is required.' }, 403)
    }

    const body = await request.json()
    const applicationId = String(body.applicationId || '')
    const uploadLink = String(body.uploadLink || '')
    const requestedExpiresAt = String(body.expiresAt || '')

    if (!applicationId || !uploadLink || !requestedExpiresAt) {
      return jsonResponse({ ok: false, message: 'Application, upload link, and expiry are required.' }, 400)
    }

    let parsedUploadUrl: URL
    try {
      parsedUploadUrl = new URL(uploadLink)
    } catch {
      return jsonResponse({ ok: false, message: 'The secure upload link is invalid.' }, 400)
    }

    const tokenMarker = '/upload-documents/'
    const markerIndex = parsedUploadUrl.pathname.indexOf(tokenMarker)
    const uploadToken = markerIndex >= 0
      ? decodeURIComponent(parsedUploadUrl.pathname.slice(markerIndex + tokenMarker.length))
      : ''

    if (!uploadToken) {
      return jsonResponse({ ok: false, message: 'The secure upload link is invalid.' }, 400)
    }

    const { data: tokenRecord, error: tokenError } = await adminClient
      .from('driver_upload_tokens')
      .select('expires_at, is_revoked')
      .eq('application_id', applicationId)
      .eq('token', uploadToken)
      .maybeSingle()

    const isExpired = tokenRecord
      ? new Date(tokenRecord.expires_at).getTime() <= Date.now()
      : true

    if (tokenError || !tokenRecord || tokenRecord.is_revoked || isExpired) {
      console.error('Document request email upload token validation failed:', tokenError)
      return jsonResponse({ ok: false, message: 'Generate a valid active upload link before sending email.' }, 400)
    }

    if (new Date(requestedExpiresAt).getTime() !== new Date(tokenRecord.expires_at).getTime()) {
      return jsonResponse({ ok: false, message: 'The upload link expiry does not match the active token.' }, 400)
    }

    const { data: application, error: applicationError } = await adminClient
      .from('driver_applications')
      .select('full_name, email')
      .eq('id', applicationId)
      .maybeSingle()

    if (applicationError || !application) {
      console.error('Document request email application lookup failed:', applicationError)
      return jsonResponse({ ok: false, message: 'The driver application could not be loaded.' }, 404)
    }

    if (!application.email) {
      return jsonResponse({ ok: false, message: 'The applicant does not have an email address on file.' }, 400)
    }

    const expiryDate = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(tokenRecord.expires_at))

    const text = `Hello ${application.full_name},

Alqudus Express Trucking has reviewed your application. Please upload your requested onboarding documents using the secure link below:

${uploadLink}

This link expires on ${expiryDate}.

Your documents are uploaded securely and are only available to authorized Alqudus Express staff.

Thank you,
Alqudus Express Trucking LLC`

    const html = `
      <p>Hello ${escapeHtml(application.full_name)},</p>
      <p>Alqudus Express Trucking has reviewed your application. Please upload your requested onboarding documents using the secure link below:</p>
      <p><a href="${escapeHtml(uploadLink)}">Upload requested documents securely</a></p>
      <p>This link expires on ${escapeHtml(expiryDate)}.</p>
      <p>Your documents are uploaded securely and are only available to authorized Alqudus Express staff.</p>
      <p>Thank you,<br>Alqudus Express Trucking LLC</p>
    `

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `Alqudus Express Trucking <${fromEmail}>`,
        to: [application.email],
        subject: 'Document Request - Alqudus Express Trucking',
        text,
        html,
      }),
    })

    if (!resendResponse.ok) {
      const resendError = await resendResponse.text()
      console.error('Resend document request email failed:', {
        status: resendResponse.status,
        response: resendError,
      })
      return jsonResponse({ ok: false, message: 'Email could not be sent.' }, 502)
    }

    return jsonResponse({ ok: true, message: 'Email sent.' })
  } catch (error) {
    console.error('Unexpected document request email failure:', error)
    return jsonResponse({ ok: false, message: 'Email could not be sent.' }, 500)
  }
})
