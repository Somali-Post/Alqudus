import { useState } from 'react'
import { BriefcaseBusiness, CheckCircle2, Mail, MapPin, MessageSquare, Phone, Send } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { companyInfo } from '../data/companyInfo'

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  reason: '',
  message: '',
}

const reasonOptions = [
  'Owner-operator application question',
  'Contract/job opportunity',
  'General question',
  'Document/onboarding question',
  'Other',
]

const contactDetails = [
  { label: 'Location', value: companyInfo.cityState, icon: MapPin },
  { label: 'Physical address', value: `${companyInfo.addressLine1}\n${companyInfo.addressLine2}`, icon: MapPin },
  { label: 'Phone', value: companyInfo.phone, icon: Phone },
  { label: 'Email', value: companyInfo.email, icon: Mail },
  {
    label: 'Business focus',
    value: companyInfo.businessFocus,
    icon: BriefcaseBusiness,
  },
]

function RequiredAsterisk() {
  return <span className="text-red-700" aria-hidden="true">*</span>
}

function FieldError({ message }) {
  return message ? <span className="text-sm font-semibold text-red-700">{message}</span> : null
}

export function ContactPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submitted, setSubmitted] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setErrors((current) => {
      if (!current[name] && !current.contact) return current
      const next = { ...current }
      delete next[name]
      delete next.contact
      return next
    })
    setSubmitted(false)
  }

  function validateForm() {
    const nextErrors = {}

    if (!form.fullName.trim()) nextErrors.fullName = 'Full name is required.'
    if (!form.phone.trim() && !form.email.trim()) {
      nextErrors.contact = 'Please provide a phone number or email address.'
    }
    if (!form.reason.trim()) nextErrors.reason = 'Please choose a reason for contact.'
    if (!form.message.trim()) nextErrors.message = 'Message is required.'

    return nextErrors
  }

  function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setSubmitted(false)
      return
    }

    setErrors({})
    setSubmitted(true)
    setForm(initialForm)
  }

  return (
    <section className="w-full max-w-full overflow-hidden bg-off-white py-10 md:py-14 lg:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-8">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-royal">CONTACT ALQUDUS EXPRESS</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-black leading-tight text-navy md:text-5xl">
            Let&apos;s Talk About Owner-Operator Opportunities
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">
            Have questions about applying, contract opportunities, or working with Alqudus Express? Send us a
            message and we&apos;ll get back to you.
          </p>

          <div className="mt-8 rounded-lg border border-light-steel/80 bg-white p-5 shadow-soft md:p-6">
            <h2 className="text-2xl font-black text-navy">Contact details</h2>
            <div className="mt-5 grid gap-4">
              {contactDetails.map((detail) => {
                const Icon = detail.icon
                return (
                  <div key={detail.label} className="flex min-w-0 items-start gap-3 border-b border-light-steel/70 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex h-10 w-10 flex-none items-center justify-center rounded-lg bg-royal/10 text-royal">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-black uppercase tracking-normal text-steel">{detail.label}</p>
                      <p className="mt-1 whitespace-pre-line font-bold leading-6 text-navy">{detail.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-royal/20 bg-white p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-1 h-6 w-6 flex-none text-royal" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-black text-navy">Owner-operators welcome</h2>
                <p className="mt-2 leading-7 text-steel">
                  If you own or operate your own truck and are looking for contract opportunities, start with the
                  application page.
                </p>
                <Button to="/apply" className="mt-4">
                  Apply Now
                </Button>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="min-w-0 rounded-lg border border-light-steel/80 bg-white p-5 shadow-soft md:p-8">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 flex-none items-center justify-center rounded-lg bg-royal text-white">
              <MessageSquare className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-navy">Send a message</h2>
              <p className="mt-2 leading-7 text-steel">
                This prototype keeps messages local and does not send data yet.
              </p>
            </div>
          </div>

          {submitted ? (
            <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-4 text-sm font-semibold leading-6 text-green-900">
              Message received. This prototype does not send messages yet, but the contact flow is ready for backend integration.
            </div>
          ) : null}

          <div className="mt-6 grid gap-5">
            <label className="grid gap-2">
              <span className="label">
                Full name <RequiredAsterisk />
              </span>
              <input
                className={`field ${errors.fullName ? 'border-red-600 focus:border-red-600 focus:ring-red-100' : ''}`}
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                placeholder="Your full name"
              />
              <FieldError message={errors.fullName} />
            </label>

            <div className="grid gap-5 md:grid-cols-2">
              <label className="grid gap-2">
                <span className="label">Phone number</span>
                <input
                  className={`field ${errors.contact ? 'border-red-600 focus:border-red-600 focus:ring-red-100' : ''}`}
                  name="phone"
                  type="tel"
                  value={form.phone}
                  onChange={updateField}
                  placeholder="Your phone number"
                />
              </label>
              <label className="grid gap-2">
                <span className="label">Email address</span>
                <input
                  className={`field ${errors.contact ? 'border-red-600 focus:border-red-600 focus:ring-red-100' : ''}`}
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={updateField}
                  placeholder="Your email address"
                />
              </label>
            </div>
            <FieldError message={errors.contact} />

            <label className="grid gap-2">
              <span className="label">
                Reason for contact <RequiredAsterisk />
              </span>
              <select
                className={`field ${errors.reason ? 'border-red-600 focus:border-red-600 focus:ring-red-100' : ''}`}
                name="reason"
                value={form.reason}
                onChange={updateField}
              >
                <option value="">Select reason</option>
                {reasonOptions.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
              <FieldError message={errors.reason} />
            </label>

            <label className="grid gap-2">
              <span className="label">
                Message <RequiredAsterisk />
              </span>
              <textarea
                className={`field min-h-40 resize-y ${errors.message ? 'border-red-600 focus:border-red-600 focus:ring-red-100' : ''}`}
                name="message"
                value={form.message}
                onChange={updateField}
                placeholder="How can Alqudus Express help?"
              />
              <FieldError message={errors.message} />
            </label>
          </div>

          <Button type="submit" className="mt-7 w-full gap-2">
            Send Message <Send className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
      </div>
    </section>
  )
}
