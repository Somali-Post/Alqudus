import { NavLink, Outlet } from 'react-router-dom'
import { navigationItems } from '../../data/navigation'
import { Button } from '../ui/Button'
import { Footer } from './Footer'

const mobileNavigationItems = navigationItems.filter((item) => item.path !== '/about')

export function MobileShell() {
  return (
    <div className="min-h-screen w-full max-w-full overflow-hidden bg-off-white text-slate-950 md:hidden">
      <header className="sticky top-0 z-40 border-b border-light-steel/70 bg-white">
        <div className="flex min-h-14 min-w-0 items-center justify-between gap-3 px-4">
          <NavLink to="/" className="flex min-w-0 items-center" aria-label="Alqudus Express home">
            <img
              src="/assets/logos/logonav.png"
              alt="Alqudus Express Trucking LLC"
              className="h-8 max-w-[185px] object-contain"
            />
          </NavLink>
          <Button to="/apply" className="min-h-10 px-4 py-2 text-xs">
            Apply
          </Button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <Footer />
      <nav
        className="fixed inset-x-0 bottom-0 z-50 w-full max-w-full overflow-hidden border-t border-light-steel bg-white px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2"
        aria-label="Mobile navigation"
      >
        <div className="grid grid-cols-4 gap-1">
          {mobileNavigationItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex min-h-16 flex-col items-center justify-center rounded-lg px-1 text-[11px] font-bold transition ${
                    isActive ? 'bg-royal text-white' : 'text-steel hover:bg-off-white'
                  }`
                }
              >
                <Icon className="mb-1 h-5 w-5" aria-hidden="true" />
                <span className="text-center leading-tight">{item.label}</span>
              </NavLink>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
