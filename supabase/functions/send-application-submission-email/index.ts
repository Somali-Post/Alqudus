import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const adminEmail = 'alqudusexpresstrucking@gmail.com'

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  })
}

function displayValue(value: string | null) {
  return value?.trim() || 'Not provided'
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

async function sendResendEmail(
  apiKey: string,
  fromEmail: string,
  payload: { to: string; subject: string; text: string; html: string },
) {
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Alqudus Express Trucking <${fromEmail}>`,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  })

  if (!response.ok) {
    throw new Error(`Resend returned ${response.status}: ${await response.text()}`)
  }
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
  const fromEmail =
    Deno.env.get('APPLICATION_FROM_EMAIL') ||
    Deno.env.get('DOCUMENT_REQUEST_FROM_EMAIL')

  if (!supabaseUrl || !serviceRoleKey || !resendApiKey || !fromEmail) {
    console.error('Application submission email function is missing server configuration.')
    return jsonResponse({ ok: false, message: 'Application email delivery is not configured.' }, 500)
  }

  try {
    const body = await request.json()
    const applicationId = String(body.applicationId || '')

    if (!applicationId) {
      return jsonResponse({ ok: false, message: 'Application ID is required.' }, 400)
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { data: application, error: applicationError } = await adminClient
      .from('driver_applications')
      .select(
        'id, created_at, source, full_name, phone, email, city, state, truck_type, trailer_type, cdl_status, insurance_status, preferred_routes',
      )
      .eq('id', applicationId)
      .maybeSingle()

    if (applicationError || !application || application.source !== 'website') {
      console.error('Application submission email lookup failed:', applicationError)
      return jsonResponse({ ok: false, message: 'Application could not be verified.' }, 404)
    }

    const ageMs = Date.now() - new Date(application.created_at).getTime()
    if (ageMs < 0 || ageMs > 30 * 60 * 1000) {
      return jsonResponse({ ok: false, message: 'Application email window has expired.' }, 403)
    }

    const { data: notification } = await adminClient
      .from('application_email_notifications')
      .select('admin_sent_at, applicant_sent_at')
      .eq('application_id', applicationId)
      .maybeSingle()

    const location = `${application.city}, ${application.state}`
    const adminText = `New owner-operator application received.

Applicant:
${application.full_name}

Phone:
${application.phone}

Email:
${displayValue(application.email)}

Location:
${location}

Truck Type:
${application.truck_type}

Trailer Type:
${displayValue(application.trailer_type)}

CDL Status:
${application.cdl_status}

Insurance Status:
${displayValue(application.insurance_status)}

Preferred Routes:
${displayValue(application.preferred_routes)}

Please review the application in the Alqudus Express Admin Dashboard.`

    const adminHtml = `
      <h2>New owner-operator application received</h2>
      <p><strong>Applicant:</strong><br>${escapeHtml(application.full_name)}</p>
      <p><strong>Phone:</strong><br>${escapeHtml(application.phone)}</p>
      <p><strong>Email:</strong><br>${escapeHtml(displayValue(application.email))}</p>
      <p><strong>Location:</strong><br>${escapeHtml(location)}</p>
      <p><strong>Truck Type:</strong><br>${escapeHtml(application.truck_type)}</p>
      <p><strong>Trailer Type:</strong><br>${escapeHtml(displayValue(application.trailer_type))}</p>
      <p><strong>CDL Status:</strong><br>${escapeHtml(application.cdl_status)}</p>
      <p><strong>Insurance Status:</strong><br>${escapeHtml(displayValue(application.insurance_status))}</p>
      <p><strong>Preferred Routes:</strong><br>${escapeHtml(displayValue(application.preferred_routes))}</p>
      <p>Please review the application in the Alqudus Express Admin Dashboard.</p>
    `

    let adminSentAt = notification?.admin_sent_at || null
    let applicantSentAt = notification?.applicant_sent_at || null
    const errors: string[] = []

    if (!adminSentAt) {
      try {
        await sendResendEmail(resendApiKey, fromEmail, {
          to: adminEmail,
          subject: 'New Driver Application - Alqudus Express Trucking',
          text: adminText,
          html: adminHtml,
        })
        adminSentAt = new Date().toISOString()
      } catch (error) {
        console.error('Admin application notification email failed:', error)
        errors.push('admin')
      }
    }

    if (application.email && !applicantSentAt) {
      const applicantText = `Hello ${application.full_name},

Thank you for applying to work with Alqudus Express Trucking LLC.

We have received your application and our team will review your details. If your application is a good fit, we may contact you to request onboarding documents through a secure upload link.

Thank you,
Alqudus Express Trucking LLC`

      const applicantHtml = `
        <p>Hello ${escapeHtml(application.full_name)},</p>
        <p>Thank you for applying to work with Alqudus Express Trucking LLC.</p>
        <p>We have received your application and our team will review your details. If your application is a good fit, we may contact you to request onboarding documents through a secure upload link.</p>
        <p>Thank you,<br>Alqudus Express Trucking LLC</p>
      `

      try {
        await sendResendEmail(resendApiKey, fromEmail, {
          to: application.email,
          subject: 'Application Received - Alqudus Express Trucking',
          text: applicantText,
          html: applicantHtml,
        })
        applicantSentAt = new Date().toISOString()
      } catch (error) {
        console.error('Applicant application confirmation email failed:', error)
        errors.push('applicant')
      }
    }

    const { error: notificationError } = await adminClient
      .from('application_email_notifications')
      .upsert({
        application_id: applicationId,
        admin_sent_at: adminSentAt,
        applicant_sent_at: applicantSentAt,
        last_attempt_at: new Date().toISOString(),
      })

    if (notificationError) {
      console.error('Application email bookkeeping failed:', notificationError)
    }

    if (errors.length > 0) {
      return jsonResponse({ ok: false, message: 'One or more application emails could not be sent.' }, 502)
    }

    return jsonResponse({ ok: true, message: 'Application emails processed.' })
  } catch (error) {
    console.error('Unexpected application submission email failure:', error)
    return jsonResponse({ ok: false, message: 'Application emails could not be sent.' }, 500)
  }
})
