import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { Button } from '../ui/Button'
import { companyInfo } from '../../data/companyInfo'

const trustItems = [
  'Owner-operator focused',
  'Contract opportunities',
  'Commission-based support',
]

const statusItems = [
  'Active carrier',
  `USDOT# ${companyInfo.dotNumber}`,
  `MC# ${companyInfo.mcNumber}`,
  companyInfo.cargoType,
  companyInfo.equipment,
]

export function HeroSection() {
  return (
    <section className="overflow-hidden bg-white">
      <div className="mx-auto grid w-full max-w-[1320px] gap-8 px-5 pb-10 pt-8 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:items-center md:gap-10 md:pb-14 md:pt-12 lg:gap-12 lg:px-8 lg:pb-16 lg:pt-14">
        <div className="min-w-0 max-w-[560px]">
          <p className="text-sm font-black uppercase tracking-normal text-royal">
            Owner-Operator Opportunities
          </p>
          <h1 className="mt-4 max-w-[520px] break-words font-display text-4xl font-black leading-[1.03] text-navy md:text-5xl lg:text-[clamp(56px,4.8vw,64px)] lg:leading-[0.98]">
            Bring Your Truck. We Bring the Work.
          </h1>
          <p className="mt-5 max-w-[540px] text-lg leading-[1.65] text-steel md:text-xl">
            {companyInfo.companyName} connects qualified owner-operators with contract trucking opportunities from {companyInfo.locationDisplay}.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button to="/apply" className="w-full sm:w-auto">Apply as Owner-Operator</Button>
            <Button to="/owner-operators" variant="secondary" className="w-full gap-2 sm:w-auto">
              Learn How It Works <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <ul className="mt-6 hidden flex-wrap gap-x-5 gap-y-2 text-sm font-bold leading-6 text-navy md:flex">
            {trustItems.map((item) => (
              <li key={item} className="flex items-center gap-2 whitespace-nowrap">
                <CheckCircle2 className="h-4 w-4 flex-none text-royal" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex min-h-[250px] w-full min-w-0 max-w-full items-center justify-center overflow-hidden md:min-h-[430px] md:justify-end lg:min-h-[470px]">
          <img
            src="/assets/images/hero.png"
            alt="Alqudus Express trucking hero"
            className="ml-auto mr-0 block w-full max-w-[840px] object-contain"
          />
        </div>
        <ul className="grid gap-2 rounded-lg border border-light-steel/80 bg-off-white p-4 text-sm font-bold leading-6 text-navy md:hidden">
          {trustItems.map((item) => (
            <li key={item} className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 flex-none text-royal" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <div className="rounded-lg border border-light-steel/80 bg-off-white p-4 md:col-span-2">
          <div className="flex flex-wrap gap-2">
            {statusItems.map((item) => (
              <span key={item} className="rounded-full border border-light-steel bg-white px-3 py-2 text-xs font-black text-navy">
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
