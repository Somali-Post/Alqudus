import { isSupabaseConfigured, supabase } from '../lib/supabaseClient'

const CONFIG_MESSAGE = 'Supabase Auth is not configured yet.'

function missingConfigResult() {
  return {
    ok: false,
    code: 'auth_not_configured',
    message: CONFIG_MESSAGE,
  }
}

export async function signInAdmin(email, password) {
  if (!isSupabaseConfigured || !supabase) return missingConfigResult()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  })

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase admin sign-in failed:', error)
    }

    return {
      ok: false,
      code: 'invalid_login',
      message: 'Email or password is incorrect.',
    }
  }

  return { ok: true, data }
}

export async function signOutAdmin() {
  if (!isSupabaseConfigured || !supabase) return missingConfigResult()

  const { error } = await supabase.auth.signOut()

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase admin sign-out failed:', error)
    }

    return {
      ok: false,
      code: 'sign_out_failed',
      message: 'Could not sign out right now. Please try again.',
    }
  }

  return { ok: true }
}

export async function getCurrentSession() {
  if (!isSupabaseConfigured || !supabase) return missingConfigResult()

  const { data, error } = await supabase.auth.getSession()

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase session lookup failed:', error)
    }

    return {
      ok: false,
      code: 'session_failed',
      message: 'Could not verify the admin session.',
    }
  }

  return { ok: true, session: data.session }
}

export async function getCurrentUser() {
  if (!isSupabaseConfigured || !supabase) return missingConfigResult()

  const { data, error } = await supabase.auth.getUser()

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase user lookup failed:', error)
    }

    return {
      ok: false,
      code: 'user_failed',
      message: 'Could not verify the admin user.',
    }
  }

  return { ok: true, user: data.user }
}

export async function getAdminProfile() {
  if (!isSupabaseConfigured || !supabase) return missingConfigResult()

  const userResult = await getCurrentUser()
  if (!userResult.ok) return userResult
  if (!userResult.user) {
    return {
      ok: false,
      code: 'not_authenticated',
      message: 'Admin login is required.',
    }
  }

  const { data, error } = await supabase
    .from('admin_profiles')
    .select('id, user_id, email, full_name, role, created_at')
    .eq('user_id', userResult.user.id)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) {
      console.error('Supabase admin profile lookup failed:', error)
    }

    return {
      ok: false,
      code: 'profile_lookup_failed',
      message: 'Admin authorization could not be verified.',
    }
  }

  if (!data) {
    return {
      ok: false,
      code: 'not_authorized',
      message: 'Your account is not authorized for admin access.',
    }
  }

  return { ok: true, profile: data, user: userResult.user }
}

export function onAuthStateChange(callback) {
  if (!isSupabaseConfigured || !supabase) {
    return { unsubscribe() {} }
  }

  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })

  return data.subscription
}
