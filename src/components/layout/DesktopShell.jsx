import { Outlet } from 'react-router-dom'
import { ContactStrip } from './ContactStrip'
import { DesktopNavbar } from './DesktopNavbar'
import { Footer } from './Footer'

export function DesktopShell() {
  return (
    <div className="hidden min-h-screen bg-off-white text-slate-950 md:block">
      <header className="sticky top-0 z-40">
        <ContactStrip />
        <DesktopNavbar />
      </header>
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
