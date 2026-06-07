import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { companyInfo } from '../data/companyInfo'
import { sendApplicationSubmissionEmail } from '../services/applicationEmailService'
import { submitDriverApplication } from '../services/applicationService'

const initialForm = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  state: '',
  truckType: '',
  trailerType: '',
  yearsExperience: '',
  cdlStatus: '',
  insuranceStatus: '',
  preferredRoutes: '',
  availability: '',
  message: '',
}

const requiredFields = {
  fullName: 'Full name is required.',
  phone: 'Phone number is required.',
  city: 'City is required.',
  state: 'Please choose your state.',
  truckType: 'Please choose your truck type.',
  cdlStatus: 'Please choose your CDL status.',
}

const benefits = [
  'Contract trucking opportunities',
  'Commission-based support',
  'Simple onboarding process',
  `${companyInfo.locationDisplay} based operation`,
]

const requirements = [
  'Own or operate your own truck',
  'Valid CDL',
  'Active insurance',
  'Reliable communication',
  'Willing to provide required documents',
]

// Keep truck/trailer compatibility rules centralized for future updates.
const trailerOptionsByTruckType = {
  'Semi truck': ['Dry van', 'Reefer', 'Flatbed', 'Step deck', 'Other'],
  'Box truck': ['Not applicable / Box truck only'],
  'Power Only': ['Not applicable / Power only'],
  Other: ['Other', 'Not sure'],
}

const selectFields = {
  truckType: ['Semi truck', 'Box truck', 'Power Only', 'Other'],
  yearsExperience: ['Less than 1 year', '1-2 years', '3-5 years', '6-10 years', '10+ years'],
  cdlStatus: ['Active CDL', 'CDL pending', 'No CDL'],
  insuranceStatus: ['Active insurance', 'Insurance pending', 'Need guidance'],
  preferredRoutes: ['Local', 'Regional', 'OTR / Long haul', 'Dedicated lanes', 'Power only', 'Open to all'],
  availability: ['Available now', 'Available within 1 week', 'Available within 2 weeks', 'Not sure yet'],
}

const stateOptions = [
  ['AL', 'Alabama (AL)'],
  ['AK', 'Alaska (AK)'],
  ['AZ', 'Arizona (AZ)'],
  ['AR', 'Arkansas (AR)'],
  ['CA', 'California (CA)'],
  ['CO', 'Colorado (CO)'],
  ['CT', 'Connecticut (CT)'],
  ['DE', 'Delaware (DE)'],
  ['FL', 'Florida (FL)'],
  ['GA', 'Georgia (GA)'],
  ['HI', 'Hawaii (HI)'],
  ['ID', 'Idaho (ID)'],
  ['IL', 'Illinois (IL)'],
  ['IN', 'Indiana (IN)'],
  ['IA', 'Iowa (IA)'],
  ['KS', 'Kansas (KS)'],
  ['KY', 'Kentucky (KY)'],
  ['LA', 'Louisiana (LA)'],
  ['ME', 'Maine (ME)'],
  ['MD', 'Maryland (MD)'],
  ['MA', 'Massachusetts (MA)'],
  ['MI', 'Michigan (MI)'],
  ['MN', 'Minnesota (MN)'],
  ['MS', 'Mississippi (MS)'],
  ['MO', 'Missouri (MO)'],
  ['MT', 'Montana (MT)'],
  ['NE', 'Nebraska (NE)'],
  ['NV', 'Nevada (NV)'],
  ['NH', 'New Hampshire (NH)'],
  ['NJ', 'New Jersey (NJ)'],
  ['NM', 'New Mexico (NM)'],
  ['NY', 'New York (NY)'],
  ['NC', 'North Carolina (NC)'],
  ['ND', 'North Dakota (ND)'],
  ['OH', 'Ohio (OH)'],
  ['OK', 'Oklahoma (OK)'],
  ['OR', 'Oregon (OR)'],
  ['PA', 'Pennsylvania (PA)'],
  ['RI', 'Rhode Island (RI)'],
  ['SC', 'South Carolina (SC)'],
  ['SD', 'South Dakota (SD)'],
  ['TN', 'Tennessee (TN)'],
  ['TX', 'Texas (TX)'],
  ['UT', 'Utah (UT)'],
  ['VT', 'Vermont (VT)'],
  ['VA', 'Virginia (VA)'],
  ['WA', 'Washington (WA)'],
  ['WV', 'West Virginia (WV)'],
  ['WI', 'Wisconsin (WI)'],
  ['WY', 'Wyoming (WY)'],
]

function CheckList({ title, items }) {
  return (
    <div className="rounded-lg border border-light-steel/80 bg-white p-5 shadow-soft">
      <h2 className="text-xl font-black text-navy">{title}</h2>
      <ul className="mt-4 grid gap-3">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-3 text-sm font-semibold leading-6 text-steel">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-none text-royal" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function RequiredAsterisk({ show }) {
  return show ? <span className="text-red-700" aria-hidden="true">*</span> : null
}

function TextField({ label, name, value, onChange, placeholder, error, type = 'text', required = false }) {
  return (
    <label className="grid gap-2">
      <span className="label">
        {label} <RequiredAsterisk show={required} />
      </span>
      <input
        className={`field ${error ? 'border-red-600 focus:border-red-600 focus:ring-red-100' : ''}`}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      {error ? <span className="text-sm font-semibold text-red-700">{error}</span> : null}
    </label>
  )
}

function SelectField({
  label,
  name,
  value,
  onChange,
  placeholder,
  options,
  error,
  required = false,
  disabled = false,
}) {
  return (
    <label className="grid gap-2">
      <span className="label">
        {label} <RequiredAsterisk show={required} />
      </span>
      <select
        className={`field ${error ? 'border-red-600 focus:border-red-600 focus:ring-red-100' : ''}`}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={Array.isArray(option) ? option[0] : option} value={Array.isArray(option) ? option[0] : option}>
            {Array.isArray(option) ? option[1] : option}
          </option>
        ))}
      </select>
      {error ? <span className="text-sm font-semibold text-red-700">{error}</span> : null}
    </label>
  )
}

export function ApplyPage() {
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})
  const [submissionStatus, setSubmissionStatus] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => {
      if (name !== 'truckType') {
        return { ...current, [name]: value }
      }

      const validTrailerOptions = trailerOptionsByTruckType[value] || []
      const hasAutomaticTrailer =
        validTrailerOptions.length === 1 && validTrailerOptions[0].startsWith('Not applicable')
      const trailerType = hasAutomaticTrailer
        ? validTrailerOptions[0]
        : validTrailerOptions.includes(current.trailerType)
          ? current.trailerType
          : ''

      return { ...current, truckType: value, trailerType }
    })
    setErrors((current) => {
      if (!current[name] && (name !== 'truckType' || !current.trailerType)) return current
      const next = { ...current }
      delete next[name]
      if (name === 'truckType') delete next.trailerType
      return next
    })
    setSubmissionStatus(null)
  }

  function validateForm() {
    const nextErrors = {}
    Object.entries(requiredFields).forEach(([name, message]) => {
      if (!form[name].trim()) {
        nextErrors[name] = message
      }
    })
    const validTrailerOptions = trailerOptionsByTruckType[form.truckType] || []
    if (form.truckType && !validTrailerOptions.includes(form.trailerType)) {
      nextErrors.trailerType = 'Please choose your trailer type.'
    }
    return nextErrors
  }

  async function handleSubmit(event) {
    event.preventDefault()
    const nextErrors = validateForm()

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors)
      setSubmissionStatus(null)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    const result = await submitDriverApplication(form)

    setIsSubmitting(false)

    if (result.ok) {
      sendApplicationSubmissionEmail(result.applicationId).then((emailResult) => {
        if (!emailResult.ok && import.meta.env.DEV) {
          console.error('Application saved, but submission emails failed:', emailResult.message)
        }
      })
      setSubmissionStatus({
        type: 'success',
        message: 'Application submitted successfully. Alqudus Express will review your details.',
      })
      setForm(initialForm)
      return
    }

    setSubmissionStatus({
      type:
        result.code === 'backend_not_configured' || result.code === 'invalid_backend_url'
          ? 'warning'
          : 'error',
      message: result.message || 'Application could not be submitted right now. Please try again later.',
    })
  }

  return (
    <section className="w-full max-w-full overflow-hidden bg-off-white py-10 md:py-14 lg:py-16">
      <div className="mx-auto grid w-full max-w-6xl gap-8 px-5 sm:px-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-10 lg:px-8">
        <div className="min-w-0">
          <p className="text-sm font-black uppercase tracking-normal text-royal">Owner-Operator Application</p>
          <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight text-navy md:text-5xl">
            Apply to Work With Alqudus Express
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-steel">
            Tell us about yourself, your truck, and the type of work you are looking for. Alqudus Express
            reviews owner-operator applications and connects qualified drivers with contract opportunities.
          </p>

          <div className="mt-7 rounded-lg border border-royal/20 bg-white p-5 shadow-soft">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-1 h-6 w-6 flex-none text-royal" aria-hidden="true" />
              <div>
                <h2 className="text-lg font-black text-navy">
                  Important: Owner-operators must provide their own truck
                </h2>
                <p className="mt-2 leading-7 text-steel">
                  Alqudus Express does not provide trucks for drivers. Applicants should already own or operate
                  their own truck and be ready for contract-based opportunities.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4">
            <CheckList title="Benefits" items={benefits} />
            <CheckList title="Requirements" items={requirements} />
          </div>
        </div>

        <div className="min-w-0">
          <form onSubmit={handleSubmit} className="rounded-lg border border-light-steel/80 bg-white p-5 shadow-soft md:p-8">
            <div>
              <h2 className="text-2xl font-black text-navy">Driver details</h2>
              <p className="mt-2 leading-7 text-steel">
                Submit your details and our team will review your application.
              </p>
            </div>

            {submissionStatus ? (
              <div
                className={`mt-5 rounded-lg border p-4 text-sm font-semibold leading-6 ${
                  submissionStatus.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-900'
                    : submissionStatus.type === 'warning'
                      ? 'border-amber-200 bg-amber-50 text-amber-900'
                      : 'border-red-200 bg-red-50 text-red-900'
                }`}
              >
                {submissionStatus.message}
              </div>
            ) : null}

            <div className="mt-6 grid gap-5 md:grid-cols-2">
              <TextField
                label="Full name"
                name="fullName"
                value={form.fullName}
                onChange={updateField}
                placeholder="Your full name"
                error={errors.fullName}
                required
              />
              <TextField
                label="Phone number"
                name="phone"
                value={form.phone}
                onChange={updateField}
                placeholder="Your phone number"
                error={errors.phone}
                type="tel"
                required
              />
              <TextField
                label="Email address"
                name="email"
                value={form.email}
                onChange={updateField}
                placeholder="Your email address"
                type="email"
              />
              <TextField
                label="City"
                name="city"
                value={form.city}
                onChange={updateField}
                placeholder="Saint Cloud"
                error={errors.city}
                required
              />
              <SelectField
                label="State"
                name="state"
                value={form.state}
                onChange={updateField}
                placeholder="Select state"
                options={stateOptions}
                error={errors.state}
                required
              />
              <SelectField
                label="Truck type"
                name="truckType"
                value={form.truckType}
                onChange={updateField}
                placeholder="Select truck type"
                options={selectFields.truckType}
                error={errors.truckType}
                required
              />
              <SelectField
                label="Trailer type"
                name="trailerType"
                value={form.trailerType}
                onChange={updateField}
                placeholder={form.truckType ? 'Select trailer type' : 'Select truck type first'}
                options={trailerOptionsByTruckType[form.truckType] || []}
                error={errors.trailerType}
                required={Boolean(form.truckType)}
                disabled={!form.truckType}
              />
              <SelectField
                label="Years of experience"
                name="yearsExperience"
                value={form.yearsExperience}
                onChange={updateField}
                placeholder="Select experience"
                options={selectFields.yearsExperience}
              />
              <SelectField
                label="CDL status"
                name="cdlStatus"
                value={form.cdlStatus}
                onChange={updateField}
                placeholder="Select CDL status"
                options={selectFields.cdlStatus}
                error={errors.cdlStatus}
                required
              />
              <SelectField
                label="Insurance status"
                name="insuranceStatus"
                value={form.insuranceStatus}
                onChange={updateField}
                placeholder="Select insurance status"
                options={selectFields.insuranceStatus}
              />
              <SelectField
                label="Availability"
                name="availability"
                value={form.availability}
                onChange={updateField}
                placeholder="Select availability"
                options={selectFields.availability}
              />
              <SelectField
                label="Preferred routes"
                name="preferredRoutes"
                value={form.preferredRoutes}
                onChange={updateField}
                placeholder="Select preferred routes"
                options={selectFields.preferredRoutes}
              />
              <label className="grid gap-2 md:col-span-2">
                <span className="label">Message/notes</span>
                <textarea
                  className="field min-h-32 resize-y"
                  name="message"
                  value={form.message}
                  onChange={updateField}
                  placeholder="Tell us about your truck, routes, availability, or questions."
                />
              </label>
            </div>

            <div className="mt-7">
              <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Application'} <Send className="h-4 w-4" aria-hidden="true" />
              </Button>
              <p className="mt-3 text-sm leading-6 text-steel">
                Your information will only be used to review your owner-operator application.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
