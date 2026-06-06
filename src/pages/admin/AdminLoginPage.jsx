import { useEffect, useState } from 'react'
import { ArrowLeft, LockKeyhole } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { getAdminProfile, getCurrentSession, signInAdmin } from '../../services/authService'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    async function redirectExistingAdmin() {
      const sessionResult = await getCurrentSession()
      if (!active || !sessionResult.ok || !sessionResult.session) return

      const profileResult = await getAdminProfile()
      if (active && profileResult.ok) {
        navigate('/admin/applications', { replace: true })
      }
    }

    redirectExistingAdmin()
    return () => {
      active = false
    }
  }, [navigate])

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setMessage(null)

    const signInResult = await signInAdmin(email, password)

    if (!signInResult.ok) {
      setSubmitting(false)
      setMessage({ type: 'error', text: signInResult.message })
      return
    }

    const profileResult = await getAdminProfile()
    setSubmitting(false)

    if (!profileResult.ok) {
      setMessage({
        type: 'error',
        text:
          profileResult.code === 'not_authorized'
            ? 'Your account is not authorized for admin access.'
            : profileResult.message,
      })
      return
    }

    const destination = location.state?.from || '/admin/applications'
    navigate(destination, { replace: true })
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-off-white px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-light-steel/80 bg-white p-6 shadow-soft sm:p-8">
        <div className="flex justify-center">
          <img
            src="/assets/logos/alqudus-logo-circle.png"
            alt="Alqudus Express Trucking LLC"
            className="h-20 w-20 rounded-full object-contain"
          />
        </div>
        <div className="mt-5 text-center">
          <p className="text-sm font-black uppercase text-royal">Internal access</p>
          <h1 className="mt-2 text-3xl font-black text-navy">Admin Login</h1>
          <p className="mt-3 leading-7 text-steel">Access the Alqudus Express internal dashboard.</p>
        </div>

        {message ? (
          <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold leading-6 text-red-900">
            {message.text}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 grid gap-5">
          <label className="grid gap-2">
            <span className="label">Email</span>
            <input
              className="field"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Admin email"
              autoComplete="email"
              required
            />
          </label>
          <label className="grid gap-2">
            <span className="label">Password</span>
            <input
              className="field"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              autoComplete="current-password"
              required
            />
          </label>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-royal px-5 font-bold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <NavLink
          to="/"
          className="mt-6 flex min-h-11 items-center justify-center gap-2 text-sm font-bold text-navy hover:text-royal"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to public site
        </NavLink>
      </section>
    </main>
  )
}
