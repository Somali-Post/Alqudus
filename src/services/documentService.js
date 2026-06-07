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
const allowedDocumentStatuses = new Set([
  'not_requested',
  'requested',
  'received',
  'approved',
  'rejected',
  'expired',
])

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

function serviceError(operation, recordId, error, fallbackMessage, updatePayload) {
  if (import.meta.env.DEV) {
    console.error('Supabase driver document operation failed:', {
      operation,
      documentId: recordId,
      updatePayload,
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

  if (!documentId) {
    return {
      ok: false,
      code: 'invalid_document_id',
      message: 'The document record could not be updated.',
    }
  }

  const cleanUpdates = Object.fromEntries(
    Object.entries({
      status: updates.status,
      notes: updates.notes,
      expires_at: updates.expires_at === '' ? null : updates.expires_at,
    }).filter(([, value]) => value !== undefined),
  )

  if (cleanUpdates.status && !allowedDocumentStatuses.has(cleanUpdates.status)) {
    return {
      ok: false,
      code: 'invalid_document_status',
      message: 'The selected document status is not valid.',
    }
  }

  if (Object.keys(cleanUpdates).length === 0) {
    return {
      ok: false,
      code: 'invalid_document_update',
      message: 'No document changes were provided.',
    }
  }

  // Use the admin-only RPC because some hosted REST configurations reject
  // browser PATCH preflights even when the table RLS policy is correct.
  const { data, error } = await supabase.rpc('update_driver_document_admin', {
    p_document_id: documentId,
    p_status: cleanUpdates.status ?? null,
    p_notes: cleanUpdates.notes ?? null,
    p_expires_at: cleanUpdates.expires_at ?? null,
  })

  if (error) {
    return serviceError(
      'updateDocumentRecordRpc',
      documentId,
      error,
      'The document record could not be updated.',
      cleanUpdates,
    )
  }

  if (!data) {
    return serviceError(
      'updateDocumentRecordRpc',
      documentId,
      { message: 'RPC returned no document row.' },
      'The document record could not be updated.',
      cleanUpdates,
    )
  }

  return { ok: true, data }
}
