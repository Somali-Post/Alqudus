import { NavLink } from 'react-router-dom'
import { navigationItems } from '../../data/navigation'
import { Button } from '../ui/Button'

export function DesktopNavbar() {
  return (
    <div className="w-full max-w-full overflow-hidden border-b border-light-steel/70 bg-white/95 backdrop-blur">
      <div className="page-shell grid h-[76px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-6 lg:gap-8">
        <NavLink to="/" className="flex min-w-0 items-center" aria-label="Alqudus Express home">
          <img
            src="/assets/logos/logonav.png"
            alt="Alqudus Express Trucking LLC"
            className="h-[46px] max-w-[220px] object-contain"
          />
        </NavLink>
        <nav className="flex min-w-0 items-center justify-center gap-1" aria-label="Main navigation">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm font-bold transition ${
                  isActive ? 'bg-royal text-white' : 'text-navy hover:bg-off-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button to="/apply">Apply Now</Button>
      </div>
    </div>
  )
}
