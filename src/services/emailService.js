import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export async function sendDocumentRequestEmail({ applicationId, uploadLink, expiresAt }) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: 'Email sending is not configured yet.',
    }
  }

  const { data, error } = await supabase.functions.invoke('send-document-request-email', {
    body: { applicationId, uploadLink, expiresAt },
  })

  if (error || !data?.ok) {
    if (import.meta.env.DEV) {
      console.error('Document request email invocation failed:', error || data)
    }

    return {
      ok: false,
      message: data?.message || 'Email could not be sent.',
    }
  }

  return { ok: true, message: 'Email sent.' }
}
