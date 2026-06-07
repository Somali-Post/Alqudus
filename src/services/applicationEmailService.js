import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export async function sendApplicationSubmissionEmail(applicationId) {
  if (!isSupabaseConfigured || !supabase || !applicationId) {
    return { ok: false, message: 'Application email delivery is not configured.' }
  }

  const { data, error } = await supabase.functions.invoke('send-application-submission-email', {
    body: { applicationId },
  })

  if (error || !data?.ok) {
    if (import.meta.env.DEV) {
      console.error('Application submission email invocation failed:', error || data)
    }
    return {
      ok: false,
      message: data?.message || 'Application emails could not be sent.',
    }
  }

  return { ok: true }
}
