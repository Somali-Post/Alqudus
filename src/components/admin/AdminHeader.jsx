import { ClipboardList, ExternalLink, LogOut } from 'lucide-react'
import { NavLink } from 'react-router-dom'

export function AdminHeader({ profile, onSignOut }) {
  const displayName = profile?.full_name || profile?.email || 'Admin'
  const secondaryIdentity = profile?.full_name ? profile?.email : profile?.role

  return (
    <header className="sticky top-0 z-30 border-b border-light-steel/70 bg-white/95 backdrop-blur">
      <div className="flex min-h-[72px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <NavLink to="/admin/applications" className="flex min-w-0 items-center gap-3 lg:hidden">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-royal text-white">
            <ClipboardList className="h-5 w-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black uppercase text-royal">Alqudus Express</p>
            <p className="truncate font-black text-navy">Admin</p>
          </div>
        </NavLink>
        <div className="hidden min-w-0 lg:block">
          <p className="text-sm font-black text-navy">Application Operations</p>
          <p className="truncate text-xs text-steel">Owner-operator recruitment workspace</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden min-w-0 border-r border-light-steel/70 pr-3 text-right sm:block">
            <p className="max-w-48 truncate text-sm font-black text-navy">{displayName}</p>
            <p className="max-w-48 truncate text-xs text-steel">{secondaryIdentity}</p>
          </div>
          <NavLink
            to="/"
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-light-steel bg-white px-3 text-sm font-bold text-navy transition hover:bg-off-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/15"
          >
            <span className="hidden sm:inline">Public site</span>
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </NavLink>
          <button
            type="button"
            onClick={onSignOut}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-navy px-3 text-sm font-bold text-white transition hover:bg-navy-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/20"
          >
            <span className="hidden sm:inline">Sign out</span>
            <LogOut className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  )
}
