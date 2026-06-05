import { CheckCircle2, ChevronRight, Dot, Truck } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { companyInfo } from '../data/companyInfo'

const summaryItems = [
  'Bring your own truck',
  'Contract/job opportunities',
  'Commission-based support',
  'Simple onboarding',
]

const steps = [
  {
    number: '01',
    title: 'Apply Online',
    text: 'Submit your basic driver, truck, and availability details.',
  },
  {
    number: '02',
    title: 'Review & Onboarding',
    text: 'We review your application and confirm key requirements.',
  },
  {
    number: '03',
    title: 'Contract Opportunities',
    text: 'Qualified owner-operators may be connected with available trucking jobs or contract opportunities.',
  },
  {
    number: '04',
    title: 'Complete Work & Commission',
    text: 'Drivers complete the work using their own equipment, and Alqudus earns through a clear commission-based arrangement.',
  },
]

const driverFit = [
  'Owner-operators with their own truck',
  'Drivers with valid CDL',
  'Drivers with active insurance',
  'Reliable communication',
  'Professional attitude',
  'Willingness to provide required documents',
]

const neededItems = [
  'CDL',
  'Insurance',
  'Truck details',
  'Trailer details',
  'Availability',
  'Preferred routes',
  'Contact information',
]

const companySnapshot = [
  companyInfo.operatingStatus,
  companyInfo.entityType,
  companyInfo.operationType,
  companyInfo.cargoType,
  companyInfo.equipment,
  `Safety Rating: ${companyInfo.safetyRating}`,
]

export function OwnerOperatorsPage() {
  return (
    <>
      <section className="w-full max-w-full overflow-hidden bg-white py-10 md:py-14 lg:py-16">
        <div className="page-shell grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:items-center">
          <div className="min-w-0">
            <p className="text-sm font-black uppercase tracking-normal text-royal">OWNER-OPERATOR PROGRAM</p>
            <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-navy md:text-5xl lg:text-6xl">
              Your Truck. Our Job Support.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">
              Alqudus Express works with qualified owner-operators who are ready for contract-based trucking
              opportunities. You bring your truck, and we help support the job flow.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to="/apply">Apply Now</Button>
              <Button to="#requirements" variant="secondary">
                View Requirements
              </Button>
            </div>
          </div>

          <aside className="relative min-w-0 overflow-hidden rounded-lg border border-light-steel/80 bg-off-white shadow-soft">
            <div className="h-1.5 bg-royal" />
            <div className="p-6 md:p-7">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-royal text-white">
                  <Truck className="h-6 w-6" aria-hidden="true" />
                </div>
                <h2 className="text-2xl font-black text-navy">Built for independent drivers</h2>
              </div>
              <div className="mt-6 grid gap-3">
                {summaryItems.map((item) => (
                  <div key={item} className="flex items-center justify-between gap-4 border-b border-light-steel/70 pb-3 last:border-b-0 last:pb-0">
                    <span className="font-bold text-navy">{item}</span>
                    <ChevronRight className="h-5 w-5 flex-none text-royal" aria-hidden="true" />
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-lg border border-royal/20 bg-white p-4">
                <p className="text-sm font-black leading-6 text-navy">
                  Alqudus Express does not provide trucks. Drivers must own or operate their own equipment.
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-off-white py-12 md:py-16">
        <div className="page-shell min-w-0">
          <div className="max-w-3xl">
            <p className="text-sm font-black uppercase tracking-normal text-royal">PROCESS</p>
            <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">How It Works</h2>
          </div>
          <div className="relative mt-10 grid min-w-0 gap-5 lg:grid-cols-4 lg:gap-0">
            <div className="absolute left-0 right-0 top-8 hidden h-px bg-light-steel lg:block" />
            {steps.map((step, index) => (
              <article key={step.number} className="relative min-w-0 lg:pr-6">
                <div className="relative z-10 flex items-center gap-4 lg:block">
                  <span className="flex h-16 w-16 flex-none items-center justify-center rounded-full border border-royal bg-white text-xl font-black text-royal shadow-soft">
                    {step.number}
                  </span>
                  <div className="h-px flex-1 bg-light-steel lg:hidden" />
                </div>
                <div className="mt-5 rounded-lg border border-light-steel/80 bg-white p-5 shadow-soft lg:min-h-[210px]">
                  <h3 className="text-xl font-black text-navy">{step.title}</h3>
                  <p className="mt-3 leading-7 text-steel">{step.text}</p>
                </div>
                {index < steps.length - 1 ? (
                  <div className="ml-8 h-6 w-px bg-light-steel lg:hidden" />
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="requirements" className="w-full max-w-full overflow-hidden bg-white py-12 md:py-16">
        <div className="page-shell grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-normal text-royal">DRIVER FIT</p>
            <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">Who We&apos;re Looking For</h2>
            <p className="mt-4 max-w-xl leading-8 text-steel">
              The program is built for professional drivers who already operate independently and are ready to
              share the details needed for contract opportunities.
            </p>
          </div>
          <div className="rounded-lg border border-light-steel/80 bg-off-white p-4 shadow-soft md:p-6">
            <div className="grid gap-1">
              {driverFit.map((item) => (
                <div key={item} className="flex min-w-0 items-start gap-3 rounded-lg bg-white px-4 py-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-royal" aria-hidden="true" />
                  <span className="font-semibold leading-6 text-navy">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-white pb-12 md:pb-16">
        <div className="page-shell">
          <div className="rounded-lg border border-light-steel/80 bg-off-white p-6 shadow-soft md:flex md:items-center md:justify-between md:gap-8 md:p-8">
            <div>
              <p className="text-sm font-black uppercase tracking-normal text-royal">Company snapshot</p>
              <h2 className="mt-3 text-2xl font-black text-navy md:text-3xl">
                {companyInfo.shortName} carrier profile
              </h2>
            </div>
            <div className="mt-5 flex flex-wrap gap-2 md:mt-0 md:max-w-2xl md:justify-end">
              {companySnapshot.map((item) => (
                <span key={item} className="rounded-full border border-light-steel bg-white px-3 py-2 text-xs font-black text-navy">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-off-white py-12 md:py-16">
        <div className="page-shell min-w-0">
          <div className="rounded-lg border border-light-steel/80 bg-white p-6 shadow-soft md:p-8">
            <div className="md:flex md:items-center md:justify-between md:gap-8">
              <div>
                <p className="text-sm font-black uppercase tracking-normal text-royal">APPLICATION READINESS</p>
                <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">What You May Need</h2>
              </div>
              <p className="mt-4 max-w-xl leading-7 text-steel md:mt-0">
                Have these basics ready so the application can move cleanly into review.
              </p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {neededItems.map((item) => (
                <span key={item} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-light-steel/80 bg-off-white px-4 text-sm font-black text-navy">
                  <Dot className="h-5 w-5 text-royal" aria-hidden="true" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-full overflow-hidden bg-navy py-12 text-white md:py-16">
        <div className="page-shell">
          <div className="border-l-4 border-royal pl-5 md:flex md:items-center md:justify-between md:gap-8 md:pl-7">
            <div>
              <h2 className="text-3xl font-black md:text-4xl">Ready to work with Alqudus Express?</h2>
              <p className="mt-3 max-w-2xl leading-7 text-white/75">
                Start with the owner-operator application and we&apos;ll review your details.
              </p>
            </div>
            <Button to="/apply" variant="secondary" className="mt-6 w-full md:mt-0 md:w-auto">
              Start Application
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
