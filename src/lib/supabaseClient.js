import { createClient } from '@supabase/supabase-js'

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim()
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

function validateSupabaseConfig(urlValue, anonKeyValue) {
  const result = {
    urlExists: Boolean(urlValue),
    anonKeyExists: Boolean(anonKeyValue),
    hostname: null,
    isValid: false,
    errorCode: null,
  }

  if (!result.urlExists || !result.anonKeyExists) {
    result.errorCode = 'missing_config'
    return result
  }

  let parsedUrl

  try {
    parsedUrl = new URL(urlValue)
  } catch {
    result.errorCode = 'invalid_url'
    return result
  }

  result.hostname = parsedUrl.hostname

  const normalizedUrl = urlValue.replace(/\/+$/, '')
  const usesHttps = normalizedUrl.startsWith('https://')
  const hasSupabaseHost = parsedUrl.hostname.endsWith('.supabase.co')
  const endsWithSupabaseHost = normalizedUrl.endsWith('.supabase.co')
  const hasRootPath = parsedUrl.pathname === '/' || parsedUrl.pathname === ''

  if (!usesHttps || !hasSupabaseHost || !endsWithSupabaseHost || !hasRootPath) {
    result.errorCode = 'invalid_url'
    return result
  }

  result.isValid = true
  return result
}

export const supabaseConfig = validateSupabaseConfig(rawSupabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = supabaseConfig.isValid

if (import.meta.env.DEV) {
  if (supabaseConfig.isValid) {
    console.info(`Supabase config detected for host: ${supabaseConfig.hostname}`)
  } else {
    console.warn('Supabase configuration is invalid or incomplete.', {
      urlExists: supabaseConfig.urlExists,
      hostname: supabaseConfig.hostname,
      anonKeyExists: supabaseConfig.anonKeyExists,
      errorCode: supabaseConfig.errorCode,
    })
  }
}

export const supabase = isSupabaseConfigured
  ? createClient(rawSupabaseUrl.replace(/\/+$/, ''), supabaseAnonKey)
  : null
