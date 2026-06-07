import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'
import { getAdminProfile } from './authService'

const ADMIN_SETUP_MESSAGE =
  'Admin access is not configured yet. Add Supabase Auth and admin RLS policies to view applications.'
const ADMIN_UPDATE_MESSAGE = 'Admin updates require authenticated admin access.'

async function requireAdminSession(message = ADMIN_SETUP_MESSAGE) {
  if (!isSupabaseConfigured || !supabase) {
    return {
      ok: false,
      code: 'admin_not_configured',
      message,
    }
  }

  const { data, error } = await supabase.auth.getSession()

  if (error || !data.session) {
    if (error && import.meta.env.DEV) {
      console.error('Supabase admin session check failed:', error)
    }

    return {
      ok: false,
      code: 'admin_not_configured',
      message,
    }
  }

  const profileResult = await getAdminProfile()

  if (!profileResult.ok) {
    return {
      ok: false,
      code: profileResult.code === 'not_authorized' ? 'not_authorized' : 'admin_not_configured',
      message:
        profileResult.code === 'not_authorized'
          ? 'Your account is not authorized for admin access.'
          : message,
    }
  }

  return { ok: true, profile: profileResult.profile }
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

export async function fetchDriverApplications() {
  const sessionResult = await requireAdminSession()
  if (!sessionResult.ok) return sessionResult

  const { data, error } = await supabase
    .from('driver_applications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase admin application fetch failed:', error)
    }

    return {
      ok: false,
      code: isPermissionError(error) ? 'admin_not_configured' : 'admin_fetch_failed',
      message: isPermissionError(error)
        ? ADMIN_SETUP_MESSAGE
        : 'Applications could not be loaded right now. Please try again later.',
    }
  }

  return { ok: true, data: data || [] }
}

export async function fetchDriverApplication(id) {
  const sessionResult = await requireAdminSession()
  if (!sessionResult.ok) return sessionResult

  const { data, error } = await supabase
    .from('driver_applications')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase admin application detail fetch failed:', error)
    }

    return {
      ok: false,
      code: isPermissionError(error) ? 'admin_not_configured' : 'admin_fetch_failed',
      message: isPermissionError(error)
        ? ADMIN_SETUP_MESSAGE
        : 'The application could not be loaded right now. Please try again later.',
    }
  }

  if (!data) {
    return {
      ok: false,
      code: 'not_found',
      message: 'This driver application could not be found.',
    }
  }

  return { ok: true, data }
}

export async function updateDriverApplicationStatus(id, status) {
  const sessionResult = await requireAdminSession(ADMIN_UPDATE_MESSAGE)
  if (!sessionResult.ok) return sessionResult

  const { error } = await supabase
    .from('driver_applications')
    .update({ status })
    .eq('id', id)

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase admin status update failed:', error)
    }

    return {
      ok: false,
      code: isPermissionError(error) ? 'admin_not_configured' : 'admin_update_failed',
      message: isPermissionError(error)
        ? ADMIN_UPDATE_MESSAGE
        : 'Status could not be saved right now. Please try again later.',
    }
  }

  return { ok: true }
}

export async function updateDriverApplicationNotes(id, adminNotes) {
  const sessionResult = await requireAdminSession(ADMIN_UPDATE_MESSAGE)
  if (!sessionResult.ok) return sessionResult

  const { error } = await supabase
    .from('driver_applications')
    .update({ admin_notes: adminNotes.trim() || null })
    .eq('id', id)

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase admin notes update failed:', error)
    }

    return {
      ok: false,
      code: isPermissionError(error) ? 'admin_not_configured' : 'admin_update_failed',
      message: isPermissionError(error)
        ? ADMIN_UPDATE_MESSAGE
        : 'Notes could not be saved right now. Please try again later.',
    }
  }

  return { ok: true }
}
