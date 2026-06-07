import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { getAdminProfile, getCurrentUser } from './authService'

const ACCESS_MESSAGE = 'Upload link management requires authorized admin access.'

async function requireAdminAccess() {
  if (!isSupabaseConfigured || !supabase) {
    return { ok: false, code: 'backend_not_configured', message: ACCESS_MESSAGE }
  }

  const [profileResult, userResult] = await Promise.all([getAdminProfile(), getCurrentUser()])
  if (!profileResult.ok || !userResult.ok || !userResult.user) {
    return { ok: false, code: 'not_authorized', message: ACCESS_MESSAGE }
  }

  return { ok: true, user: userResult.user }
}

function createSecureToken() {
  const randomBytes = new Uint8Array(24)
  crypto.getRandomValues(randomBytes)
  const randomPart = Array.from(randomBytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${crypto.randomUUID()}-${randomPart}`
}

function serviceError(operation, error, fallbackMessage) {
  if (import.meta.env.DEV) {
    console.error(`Supabase upload token ${operation} failed:`, error)
  }

  return {
    ok: false,
    code: error?.code === '42501' ? 'not_authorized' : 'upload_token_error',
    message: error?.code === '42501' ? ACCESS_MESSAGE : fallbackMessage,
  }
}

export async function generateUploadToken(applicationId) {
  const access = await requireAdminAccess()
  if (!access.ok) return access

  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  const token = createSecureToken()

  const { data, error } = await supabase
    .from('driver_upload_tokens')
    .insert({
      application_id: applicationId,
      token,
      expires_at: expiresAt.toISOString(),
      created_by: access.user.id,
    })
    .select()
    .single()

  if (error) return serviceError('generation', error, 'The upload link could not be generated.')

  return {
    ok: true,
    data,
    url: `${window.location.origin}/upload-documents/${token}`,
  }
}

export async function fetchUploadTokensForApplication(applicationId) {
  const access = await requireAdminAccess()
  if (!access.ok) return access

  const { data, error } = await supabase
    .from('driver_upload_tokens')
    .select('*')
    .eq('application_id', applicationId)
    .order('created_at', { ascending: false })

  if (error) return serviceError('fetch', error, 'Upload links could not be loaded.')

  return {
    ok: true,
    data: (data || []).map((item) => ({
      ...item,
      url: `${window.location.origin}/upload-documents/${item.token}`,
    })),
  }
}

export async function revokeUploadToken(tokenId) {
  const access = await requireAdminAccess()
  if (!access.ok) return access

  const { data, error } = await supabase
    .from('driver_upload_tokens')
    .update({ is_revoked: true })
    .eq('id', tokenId)
    .select()
    .single()

  if (error) return serviceError('revocation', error, 'The upload link could not be revoked.')
  return { ok: true, data }
}
