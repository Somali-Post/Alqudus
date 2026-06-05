import { CheckCircle2, MapPin, MessageSquare, ShieldCheck, Truck, UserCheck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { companyInfo } from '../data/companyInfo'

const snapshotItems = [
  'Active carrier',
  `USDOT# ${companyInfo.dotNumber}`,
  `MC# ${companyInfo.mcNumber}`,
  `${companyInfo.operationType} operation`,
  companyInfo.cargoType,
  `${companyInfo.equipment} focus`,
]

const modelSteps = [
  {
    number: '01',
    title: 'Owner-operators apply',
    text: 'Drivers share their contact details, truck type, availability, and operating preferences.',
  },
  {
    number: '02',
    title: 'Alqudus reviews fit',
    text: 'The company reviews applications and confirms whether the driver is ready for contract opportunities.',
  },
  {
    number: '03',
    title: 'Work is supported through commission',
    text: 'Drivers complete jobs using their own equipment, while Alqudus earns through a clear commission-based model.',
  },
]

const values = [
  {
    title: 'Professional Support',
    text: 'We keep the process organized, direct, and focused on serious owner-operators.',
    icon: ShieldCheck,
  },
  {
    title: 'Driver-Focused Model',
    text: 'The business is built around independent drivers who already operate their own equipment.',
    icon: Truck,
  },
  {
    title: 'Clear Communication',
    text: 'From application to onboarding, expectations should be simple and transparent.',
    icon: MessageSquare,
  },
]

export function AboutPage() {
  return (
    <>
      <section className="w-full max-w-full overflow-hidden bg-white py-10 md:py-14 lg:py-16">
        <div className="page-shell grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(340px,0.72fr)] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-normal text-royal">ABOUT ALQUDUS EXPRESS</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-black leading-tight text-navy md:text-5xl lg:text-6xl">
              Built to Support Independent Trucking Professionals
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-steel">
              {companyInfo.companyName} is a {companyInfo.locationDisplay} based trucking support company focused
              on helping qualified owner-operators access contract opportunities.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/apply">Apply as Owner-Operator</Button>
              <Button to="/contact" variant="secondary">
                Contact Us
              </Button>
            </div>
          </div>

          <aside className="overflow-hidden rounded-lg border border-light-steel/80 bg-off-white shadow-soft">
            <div className="h-1.5 bg-royal" />
            <div className="p-5 md:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-royal text-white">
                  <UserCheck className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-black text-navy">Company snapshot</h2>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {snapshotItems.map((item) => (
                  <span key={item} className="rounded-full border border-light-steel bg-white px-3 py-2 text-xs font-black text-navy">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-off-white py-12 md:py-16">
        <div className="page-shell">
          <div className="rounded-lg border border-light-steel/80 bg-white shadow-soft">
            <div className="grid gap-0 lg:grid-cols-[0.36fr_0.64fr]">
              <div className="border-b border-light-steel/80 p-6 lg:border-b-0 lg:border-r lg:p-8">
                <p className="text-sm font-black uppercase tracking-normal text-royal">Business model</p>
                <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">What We Do</h2>
              </div>
              <div className="border-l-4 border-royal p-6 md:p-8">
                <p className="text-lg leading-8 text-steel">
                  {companyInfo.shortName} works with drivers who already own or operate their own trucks. The
                  company helps support job flow, onboarding, and contract-based opportunities while earning
                  through a commission-based arrangement.
                </p>
                <div className="mt-6 rounded-lg bg-off-white p-4">
                  <p className="font-black leading-7 text-navy">
                    {companyInfo.shortName} does not provide trucks. Drivers must bring or operate their own
                    equipment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-white py-12 md:py-16">
        <div className="page-shell">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-normal text-royal">Our model</p>
            <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">How the Relationship Works</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {modelSteps.map((step) => (
              <article key={step.number} className="rounded-lg border border-light-steel/80 bg-off-white p-6">
                <span className="text-4xl font-black text-royal">{step.number}</span>
                <h3 className="mt-5 text-xl font-black text-navy">{step.title}</h3>
                <p className="mt-3 leading-7 text-steel">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-off-white py-12 md:py-16">
        <div className="page-shell">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-normal text-royal">Operating principles</p>
            <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">What Guides the Work</h2>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <article key={value.title} className="rounded-lg border border-light-steel/80 bg-white p-6 shadow-soft">
                  <Icon className="h-8 w-8 text-royal" aria-hidden="true" />
                  <h3 className="mt-5 text-xl font-black text-navy">{value.title}</h3>
                  <p className="mt-3 leading-7 text-steel">{value.text}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-white py-12 md:py-16">
        <div className="page-shell grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-royal text-white">
            <MapPin className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-navy md:text-4xl">Based in {companyInfo.locationDisplay}</h2>
            <p className="mt-4 max-w-3xl text-lg leading-8 text-steel">
              Operating from Minnesota, {companyInfo.shortName} is positioned to support owner-operators looking
              for local, regional, and long-haul contract trucking opportunities.
            </p>
            <div className="mt-5 inline-flex max-w-full items-start gap-3 rounded-lg border border-light-steel/80 bg-off-white p-4 font-bold leading-7 text-navy">
              <CheckCircle2 className="mt-1 h-5 w-5 flex-none text-royal" aria-hidden="true" />
              <span>{companyInfo.address}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-navy py-12 text-white md:py-16">
        <div className="page-shell md:flex md:items-center md:justify-between md:gap-8">
          <div>
            <h2 className="text-3xl font-black md:text-4xl">Interested in working with Alqudus Express?</h2>
            <p className="mt-3 max-w-2xl leading-7 text-white/75">
              Start with the owner-operator application and we&apos;ll review your details.
            </p>
          </div>
          <Button to="/apply" variant="secondary" className="mt-6 w-full md:mt-0 md:w-auto">
            Start Application
          </Button>
        </div>
      </section>
    </>
  )
}
