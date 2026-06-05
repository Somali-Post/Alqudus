import { BriefcaseBusiness, Mail, MapPin, Phone } from 'lucide-react'
import { companyInfo } from '../../data/companyInfo'

export function ContactStrip() {
  return (
    <div className="w-full max-w-full overflow-hidden border-b border-light-steel/70 bg-off-white">
      <div className="page-shell flex h-10 min-w-0 items-center justify-between gap-6 text-xs font-semibold text-steel">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-royal" aria-hidden="true" />
          <span>{companyInfo.cityState}</span>
        </div>
        <div className="flex items-center gap-2">
          <BriefcaseBusiness className="h-4 w-4 text-royal" aria-hidden="true" />
          <span>Owner-operators welcome</span>
        </div>
        <div className="flex min-w-0 items-center gap-5">
          <span className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-royal" aria-hidden="true" />
            {companyInfo.phone}
          </span>
          <span className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-royal" aria-hidden="true" />
            {companyInfo.email}
          </span>
        </div>
      </div>
    </div>
  )
}
