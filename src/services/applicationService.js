import { isSupabaseConfigured, supabase, supabaseConfig } from '../lib/supabaseClient'

function cleanText(value) {
  return typeof value === 'string' ? value.trim() : ''
}

function emptyToNull(value) {
  const cleaned = cleanText(value)
  return cleaned || null
}

function mapApplicationPayload(applicationData) {
  return {
    full_name: cleanText(applicationData.fullName),
    phone: cleanText(applicationData.phone),
    email: emptyToNull(applicationData.email),
    city: cleanText(applicationData.city),
    state: cleanText(applicationData.state),
    truck_type: cleanText(applicationData.truckType),
    trailer_type: emptyToNull(applicationData.trailerType),
    years_experience: emptyToNull(applicationData.yearsExperience),
    cdl_status: cleanText(applicationData.cdlStatus),
    insurance_status: emptyToNull(applicationData.insuranceStatus),
    preferred_routes: emptyToNull(applicationData.preferredRoutes),
    availability: emptyToNull(applicationData.availability),
    message: emptyToNull(applicationData.message),
    source: 'website',
  }
}

export async function submitDriverApplication(applicationData) {
  if (!isSupabaseConfigured || !supabase) {
    const hasInvalidUrl =
      supabaseConfig.urlExists &&
      supabaseConfig.anonKeyExists &&
      supabaseConfig.errorCode === 'invalid_url'

    return {
      ok: false,
      code: hasInvalidUrl ? 'invalid_backend_url' : 'backend_not_configured',
      message: hasInvalidUrl
        ? 'Could not reach the backend. Please check the Supabase project URL in .env.local.'
        : 'Backend is not connected yet. The form is ready, but applications cannot be submitted until Supabase is configured.',
    }
  }

  const payload = mapApplicationPayload(applicationData)

  const requiredValues = [
    payload.full_name,
    payload.phone,
    payload.city,
    payload.state,
    payload.truck_type,
    payload.cdl_status,
  ]

  if (requiredValues.some((value) => !value)) {
    return {
      ok: false,
      code: 'invalid_payload',
      message: 'Please complete the required application fields before submitting.',
    }
  }

  try {
    const { data: applicationId, error } = await supabase.rpc('submit_driver_application', {
      p_full_name: payload.full_name,
      p_phone: payload.phone,
      p_email: payload.email,
      p_city: payload.city,
      p_state: payload.state,
      p_truck_type: payload.truck_type,
      p_trailer_type: payload.trailer_type,
      p_years_experience: payload.years_experience,
      p_cdl_status: payload.cdl_status,
      p_insurance_status: payload.insurance_status,
      p_preferred_routes: payload.preferred_routes,
      p_availability: payload.availability,
      p_message: payload.message,
    })

    if (error) {
      if (import.meta.env.DEV) {
        console.error('Supabase driver application insert failed:', error)
      }

      const errorText = `${error.message || ''} ${error.details || ''}`.toLowerCase()
      const isNetworkError =
        errorText.includes('failed to fetch') ||
        errorText.includes('network') ||
        errorText.includes('name_not_resolved')
      const isPermissionError =
        error.code === '42501' ||
        errorText.includes('row-level security') ||
        errorText.includes('permission denied')

      return {
        ok: false,
        code: isNetworkError
          ? 'backend_unreachable'
          : isPermissionError
            ? 'backend_permissions'
            : 'supabase_error',
        message: isNetworkError
          ? 'Could not reach the backend. Please check the Supabase project URL in .env.local.'
          : isPermissionError
            ? 'Application submissions are not enabled yet. Please check the Supabase insert policy.'
          : 'Application could not be submitted right now. Please try again later.',
      }
    }

    return {
      ok: true,
      applicationId,
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase driver application request failed:', error)
    }

    return {
      ok: false,
      code: 'backend_unreachable',
      message: 'Could not reach the backend. Please check the Supabase project URL in .env.local.',
    }
  }
}
