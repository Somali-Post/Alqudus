import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { getAdminProfile } from './authService'

export const standardDocumentTypes = [
  'drivers_license_front',
  'drivers_license_back',
  'cdl',
  'insurance',
  'truck_registration',
  'w9_tax_form',
  'medical_card',
  'ssn_verification',
  'other',
]

const ACCESS_MESSAGE = 'Document tracking requires authorized admin access.'

async function requireAdminAccess() {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, code: 'backend_not_configured', message: ACCESS_MESSAGE }
  }

  const profileResult = await getAdminProfile()
  if (!profileResult.ok) {
    return {
      ok: false,
      code: profileResult.code,
      message: ACCESS_MESSAGE,
    }
  }

  return { ok: true }
}

function isPermissionError(error) {
  const text = `${error?.message || ''} ${error?.details || ''}`.toLowerCase()
  return (
    error?.code === '42501' ||
    text.includes('row-level security') ||
    text.includes('permission denied') ||
    text.includes('unauthorized')
  )
}

function serviceError(operation, recordId, error, fallbackMessage) {
  if (import.meta.env.DEV) {
    console.error('Supabase driver document operation failed:', {
      operation,
      documentId: recordId,
      error,
    })
  }

  return {
    ok: false,
    code: isPermissionError(error) ? 'not_authorized' : 'document_operation_failed',
    message: isPermissionError(error) ? ACCESS_MESSAGE : fallbackMessage,
  }
}

export async function fetchDocumentsForApplication(applicationId) {
  const access = await requireAdminAccess()
  if (!access.ok) return access

  const { data, error } = await supabase
    .from('driver_documents')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: true })

  if (error) {
    return serviceError(
      'fetchDocumentsForApplication',
      applicationId,
      error,
      'Documents could not be loaded right now.',
    )
  }
  return { ok: true, data: data || [] }
}

export async function upsertDocumentChecklist(applicationId) {
  const access = await requireAdminAccess()
  if (!access.ok) return access

  const rows = standardDocumentTypes.map((documentType) => ({
    application_id: applicationId,
    document_type: documentType,
  }))

  const { error } = await supabase
    .from('driver_documents')
    .upsert(rows, {
      onConflict: 'application_id,document_type',
      ignoreDuplicates: true,
    })

  if (error) {
    return serviceError(
      'upsertDocumentChecklist',
      applicationId,
      error,
      'The document checklist could not be created.',
    )
  }
  return fetchDocumentsForApplication(applicationId)
}

export async function updateDocumentRecord(documentId, updates) {
  const access = await requireAdminAccess()
  if (!access.ok) return access

  const cleanUpdates = Object.fromEntries(
    Object.entries({
      status: updates.status,
      notes: updates.notes,
      expires_at: updates.expires_at,
    }).filter(([, value]) => value !== undefined),
  )

  if (Object.keys(cleanUpdates).length === 0) {
    return {
      ok: false,
      code: 'invalid_document_update',
      message: 'No document changes were provided.',
    }
  }

  const { data, error } = await supabase
    .from('driver_documents')
    .update({
      ...cleanUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', documentId)
    .select()
    .single()

  if (error) {
    return serviceError(
      'updateDocumentRecord',
      documentId,
      error,
      'The document record could not be updated.',
    )
  }
  return { ok: true, data }
}
