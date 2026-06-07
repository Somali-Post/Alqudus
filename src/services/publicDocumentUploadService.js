import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

const CONFIG_MESSAGE = 'Secure document upload is not configured yet.'

export async function validateDocumentUploadToken(token) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, message: CONFIG_MESSAGE }
  }

  const { data, error } = await supabase.functions.invoke('driver-document-upload', {
    body: { action: 'validate', token },
  })

  if (error || !data?.ok) {
    if (import.meta.env.DEV && error) {
      console.error('Document upload token validation failed:', error)
    }
    return {
      ok: false,
      message: data?.message || 'This upload link is invalid, expired, or revoked.',
    }
  }

  return data
}

export async function uploadDriverDocument(token, documentId, file) {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, message: CONFIG_MESSAGE }
  }

  const formData = new FormData()
  formData.append('action', 'upload')
  formData.append('token', token)
  formData.append('documentId', documentId)
  formData.append('file', file)

  const { data, error } = await supabase.functions.invoke('driver-document-upload', {
    body: formData,
  })

  if (error || !data?.ok) {
    if (import.meta.env.DEV && error) {
      console.error('Secure document upload failed:', error)
    }
    return {
      ok: false,
      message: data?.message || 'The document could not be uploaded. Please try again.',
    }
  }

  return data
}
