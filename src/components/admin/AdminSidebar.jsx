import { ClipboardList } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const adminLinks = [
  { label: 'Applications', path: '/admin/applications', icon: ClipboardList },
]

export function AdminSidebar() {
  return (
    <aside className="hidden min-h-screen w-[260px] flex-none border-r border-white/10 bg-navy px-4 py-6 text-white lg:block">
      <NavLink
        to="/admin/applications"
        className="flex flex-col items-center border-b border-white/15 px-3 pb-8 pt-3 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      >
        <img
          src="/assets/logos/circular-logo-dark.png"
          alt="Alqudus Express Trucking LLC"
          className="h-[120px] w-[120px] flex-none object-contain"
        />
        <p className="mt-4 whitespace-nowrap text-lg font-black text-white">Operations Dashboard</p>
      </NavLink>
      <nav className="mt-7 grid gap-2" aria-label="Admin navigation">
        {adminLinks.map((link) => {
          const Icon = link.icon
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex min-h-12 items-center gap-3 rounded-lg px-3 text-sm font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${
                  isActive ? 'bg-royal text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" aria-hidden="true" />
              {link.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
