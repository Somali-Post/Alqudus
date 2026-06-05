import { BriefcaseBusiness, ClipboardCheck, HandCoins, Truck } from 'lucide-react'
import { Button } from '../ui/Button'

const services = [
  {
    title: 'Bring Your Own Truck',
    text: 'Alqudus Express works with owner-operators who already have their own truck and are ready for contract opportunities.',
    icon: Truck,
  },
  {
    title: 'We Help Source Work',
    text: 'The company supports drivers by helping connect them with available trucking jobs and contract opportunities.',
    icon: BriefcaseBusiness,
  },
  {
    title: 'Clear Commission Model',
    text: 'Drivers complete the work using their own equipment, while Alqudus earns through a clear commission-based arrangement.',
    icon: HandCoins,
  },
  {
    title: 'Simple Driver Onboarding',
    text: 'Drivers can apply online, share their details, and begin the approval process without unnecessary back-and-forth.',
    icon: ClipboardCheck,
  },
]

export function ServiceCards() {
  return (
    <section className="w-full max-w-full overflow-hidden bg-off-white pb-12 pt-12 md:pb-16 md:pt-14 lg:pb-20 lg:pt-16">
      <div className="page-shell min-w-0">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-black uppercase tracking-normal text-royal">Driver support</p>
          <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">Built for Owner-Operators</h2>
          <p className="mt-4 text-lg leading-8 text-steel">
            Alqudus Express helps independent drivers stay focused on the road while we support the job flow,
            onboarding, and commission-based opportunities.
          </p>
        </div>
        <div className="mt-10 grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {services.map((service) => {
            const Icon = service.icon
            return (
              <article
                key={service.title}
                className="min-w-0 rounded-lg border border-light-steel/80 bg-white p-6 shadow-soft"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-royal/10 text-royal">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-5 text-xl font-black text-navy">{service.title}</h3>
                <p className="mt-3 leading-7 text-steel">{service.text}</p>
              </article>
            )
          })}
        </div>
        <div className="mt-10 min-w-0 rounded-lg border border-light-steel/80 bg-white p-6 shadow-soft md:flex md:items-center md:justify-between md:gap-8 md:p-8">
          <div className="min-w-0">
            <h3 className="text-2xl font-black text-navy">Ready to work with Alqudus Express?</h3>
            <p className="mt-2 max-w-2xl leading-7 text-steel">
              Start with a simple owner-operator application and we&apos;ll review your details.
            </p>
          </div>
          <Button to="/apply" className="mt-5 w-full md:mt-0 md:w-auto">
            Apply Now
          </Button>
        </div>
      </div>
    </section>
  )
}
