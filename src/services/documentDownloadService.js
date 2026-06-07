import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

export async function getDocumentDownloadUrl(documentId) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      message: 'Secure document access is not configured yet.',
    }
  }

  if (!documentId) {
    return {
      ok: false,
      message: 'The document could not be opened.',
    }
  }

  const { data, error } = await supabase.functions.invoke(
    'get-driver-document-download-url',
    {
      body: { documentId },
    },
  )

  if (error || !data?.ok || !data?.signedUrl) {
    if (import.meta.env.DEV) {
      console.error('Document download URL request failed:', {
        documentId,
        error: error || data,
      })
    }

    return {
      ok: false,
      message: 'Could not open document.',
    }
  }

  return {
    ok: true,
    signedUrl: data.signedUrl,
    fileName: data.fileName,
    documentType: data.documentType,
  }
}
