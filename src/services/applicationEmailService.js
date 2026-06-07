import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export async function sendApplicationSubmissionEmail(applicationId) {
  if (!isSupabaseConfigured || !supabase || !applicationId) {
    return { ok: false, message: 'Application email delivery is not configured.' }
  }

  const { data, error } = await supabase.functions.invoke('send-application-submission-email', {
    body: { applicationId },
  })

  if (import.meta.env.DEV) {
    console.info('Application submission email result:', {
      invocationError: error || null,
      response: data || null,
    })
  }

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Application submission email invocation failed:', error)
    }
    return {
      ok: false,
      message: 'Application emails could not be sent.',
    }
  }

  return {
    ok: Boolean(data?.success),
    adminEmailSent: Boolean(data?.adminEmailSent),
    applicantEmailSent: Boolean(data?.applicantEmailSent),
    applicantEmailSkipped: Boolean(data?.applicantEmailSkipped),
    adminEmailError: data?.adminEmailError || null,
    applicantEmailError: data?.applicantEmailError || null,
    message: data?.adminEmailError || data?.applicantEmailError || null,
  }
}
