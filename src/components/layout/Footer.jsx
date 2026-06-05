import { NavLink } from 'react-router-dom'
import { companyInfo } from '../../data/companyInfo'

const quickLinks = [
  { label: 'Home', path: '/' },
  { label: 'Owner Operators', path: '/owner-operators' },
  { label: 'Apply', path: '/apply' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
]

export function Footer() {
  return (
    <footer className="w-full max-w-full overflow-hidden bg-navy text-white">
      <div className="page-shell pb-28 pt-10 md:py-12">
        <div className="grid gap-8 md:grid-cols-[1.2fr_0.8fr_0.9fr] md:items-start">
          <div className="min-w-0">
            <div className="flex items-center gap-4">
              <img
                src="/assets/logos/alqudus-logo-circle.png"
                alt="Alqudus Express Trucking LLC"
                className="h-14 w-14 flex-none rounded-full object-contain"
              />
              <div>
                <h2 className="text-xl font-black">{companyInfo.companyName}</h2>
                <p className="mt-1 text-sm text-white/70">{companyInfo.locationDisplay}</p>
              </div>
            </div>
            <p className="mt-5 max-w-md leading-7 text-white/70">
              {companyInfo.businessFocus}.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-normal text-white">Quick links</h3>
            <nav className="mt-4 grid gap-2" aria-label="Footer navigation">
              {quickLinks.map((link) => (
                <NavLink key={link.path} to={link.path} className="text-sm font-semibold text-white/70 transition hover:text-white">
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-normal text-white">Contact</h3>
            <div className="mt-4 grid gap-2 text-sm font-semibold text-white/70">
              <p>{companyInfo.phone}</p>
              <p>{companyInfo.email}</p>
              <p>USDOT# {companyInfo.dotNumber} | MC# {companyInfo.mcNumber}</p>
            </div>
            <div className="mt-5 h-1 w-16 rounded-full bg-royal" />
          </div>
        </div>

        <div className="mt-8 border-t border-white/15 pt-5 text-sm text-white/55">
          &copy; 2026 {companyInfo.companyName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
