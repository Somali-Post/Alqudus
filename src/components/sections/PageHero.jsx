import { Button } from '../ui/Button'
import { LogoMark } from '../ui/LogoMark'

export function PageHero({ eyebrow, title, children, primaryAction, secondaryAction }) {
  return (
    <section className="bg-white">
      <div className="page-shell grid gap-8 py-10 md:grid-cols-[1.25fr_0.75fr] md:items-center md:py-16 lg:py-20">
        <div>
          {eyebrow ? (
            <p className="mb-3 text-sm font-black uppercase tracking-normal text-royal">{eyebrow}</p>
          ) : null}
          <h1 className="font-display text-4xl font-black leading-tight text-navy md:text-5xl lg:text-6xl">
            {title}
          </h1>
          <div className="mt-5 max-w-2xl text-lg leading-8 text-steel">{children}</div>
          {(primaryAction || secondaryAction) && (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              {primaryAction ? <Button to={primaryAction.to}>{primaryAction.label}</Button> : null}
              {secondaryAction ? (
                <Button to={secondaryAction.to} variant="secondary">
                  {secondaryAction.label}
                </Button>
              ) : null}
            </div>
          )}
        </div>
        <div className="card flex items-center justify-center p-8">
          <LogoMark size="h-40 w-40 md:h-56 md:w-56" />
        </div>
      </div>
    </section>
  )
}
