import { Button } from '../components/ui/Button'

export function NotFoundPage() {
  return (
    <section className="section-pad">
      <div className="page-shell max-w-3xl">
        <div className="card p-8">
          <p className="text-sm font-black uppercase tracking-normal text-royal">404</p>
          <h1 className="mt-3 text-4xl font-black text-navy">Page not found</h1>
          <p className="mt-4 leading-7 text-steel">This page does not exist in the Phase 1 prototype.</p>
          <div className="mt-6">
            <Button to="/">Back Home</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
