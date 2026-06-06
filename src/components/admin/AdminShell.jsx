import { useEffect, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import {
  getAdminProfile,
  getCurrentSession,
  onAuthStateChange,
  signOutAdmin,
} from '../../services/authService'
import { AdminHeader } from './AdminHeader'
import { AdminSidebar } from './AdminSidebar'

export function AdminShell() {
  const location = useLocation()
  const [authState, setAuthState] = useState({
    loading: true,
    session: null,
    profile: null,
    unauthorized: false,
    message: null,
  })

  useEffect(() => {
    let active = true

    async function verifyAccess() {
      const sessionResult = await getCurrentSession()
      if (!active) return

      if (!sessionResult.ok || !sessionResult.session) {
        setAuthState({
          loading: false,
          session: null,
          profile: null,
          unauthorized: false,
          message: null,
        })
        return
      }

      const profileResult = await getAdminProfile()
      if (!active) return

      if (!profileResult.ok) {
        setAuthState({
          loading: false,
          session: sessionResult.session,
          profile: null,
          unauthorized: profileResult.code === 'not_authorized',
          message: profileResult.message,
        })
        return
      }

      setAuthState({
        loading: false,
        session: sessionResult.session,
        profile: profileResult.profile,
        unauthorized: false,
        message: null,
      })
    }

    verifyAccess()
    const subscription = onAuthStateChange(() => {
      verifyAccess()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  async function handleSignOut() {
    await signOutAdmin()
    setAuthState({
      loading: false,
      session: null,
      profile: null,
      unauthorized: false,
      message: null,
    })
  }

  if (authState.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-off-white p-6">
        <p className="font-bold text-steel">Verifying admin access...</p>
      </div>
    )
  }

  if (!authState.session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  if (authState.unauthorized || !authState.profile) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-off-white px-4 py-10">
        <section className="w-full max-w-lg rounded-lg border border-light-steel/80 bg-white p-6 text-center shadow-soft sm:p-8">
          <AlertCircle className="mx-auto h-10 w-10 text-royal" aria-hidden="true" />
          <h1 className="mt-4 text-2xl font-black text-navy">Your account is not authorized for admin access.</h1>
          <p className="mt-3 leading-7 text-steel">
            Ask an existing owner to add your Supabase user ID to the admin profiles table.
          </p>
          {authState.message ? <p className="mt-3 text-sm font-semibold text-steel">{authState.message}</p> : null}
          <button
            type="button"
            onClick={handleSignOut}
            className="mt-6 min-h-12 w-full rounded-lg bg-navy px-5 font-bold text-white hover:bg-navy-dark"
          >
            Sign out
          </button>
        </section>
      </main>
    )
  }

  return (
    <div className="flex min-h-screen w-full max-w-full overflow-hidden bg-off-white text-slate-950">
      <AdminSidebar />
      <div className="min-w-0 flex-1">
        <AdminHeader profile={authState.profile} onSignOut={handleSignOut} />
        <main className="min-w-0">
          <Outlet context={{ adminProfile: authState.profile }} />
        </main>
      </div>
    </div>
  )
}
