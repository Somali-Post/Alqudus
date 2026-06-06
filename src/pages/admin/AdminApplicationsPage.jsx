import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ClipboardList,
  FileClock,
  FilterX,
  FileCheck2,
  Inbox,
  PhoneCall,
  Search,
  ShieldAlert,
  UserCheck,
  UserX,
  X,
} from 'lucide-react'
import {
  fetchDriverApplications,
  updateDriverApplicationNotes,
  updateDriverApplicationStatus,
} from '../../services/adminApplicationService'
import {
  upsertDocumentChecklist,
  updateDocumentRecord,
} from '../../services/documentService'

const statuses = [
  'new',
  'contacted',
  'documents_requested',
  'approved',
  'rejected',
  'inactive',
]

const currentTruckTypes = ['Semi truck', 'Box truck', 'Power Only', 'Other']

const documentStatuses = [
  'not_requested',
  'requested',
  'received',
  'approved',
  'rejected',
  'expired',
]

const documentLabels = {
  drivers_license_front: "Driver's License Front",
  drivers_license_back: "Driver's License Back",
  cdl: 'CDL',
  insurance: 'Insurance',
  truck_registration: 'Truck Registration',
  w9_tax_form: 'W-9 / Tax Form',
  medical_card: 'Medical Card',
  ssn_verification: 'Social Security Verification',
  other: 'Other',
}

const expiringDocumentTypes = new Set([
  'drivers_license_front',
  'drivers_license_back',
  'cdl',
  'insurance',
  'truck_registration',
  'medical_card',
])

const documentStatusStyles = {
  not_requested: 'border-slate-200 bg-slate-100 text-slate-700',
  requested: 'border-blue-200 bg-blue-50 text-blue-800',
  received: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-green-200 bg-green-50 text-green-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  expired: 'border-red-200 bg-red-50 text-red-800',
}

const statusStyles = {
  new: 'border-blue-200 bg-blue-50 text-blue-800',
  contacted: 'border-slate-200 bg-slate-100 text-slate-700',
  documents_requested: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-green-200 bg-green-50 text-green-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  inactive: 'border-slate-200 bg-slate-100 text-slate-600',
}

const statDefinitions = [
  { status: 'new', label: 'New', icon: ClipboardList, accent: 'border-blue-200 bg-blue-50 text-blue-700' },
  { status: 'contacted', label: 'Contacted', icon: PhoneCall, accent: 'border-slate-200 bg-slate-100 text-slate-700' },
  {
    status: 'documents_requested',
    label: 'Documents Requested',
    icon: FileClock,
    accent: 'border-amber-200 bg-amber-50 text-amber-700',
  },
  { status: 'approved', label: 'Approved', icon: UserCheck, accent: 'border-green-200 bg-green-50 text-green-700' },
  { status: 'rejected', label: 'Rejected', icon: UserX, accent: 'border-red-200 bg-red-50 text-red-700' },
]

function formatStatus(status) {
  return (status || 'new')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(value, includeTime = false) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...(includeTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(new Date(value))
}

function StatusBadge({ status }) {
  const normalizedStatus = status || 'new'
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${statusStyles[normalizedStatus] || statusStyles.inactive}`}
    >
      {formatStatus(normalizedStatus)}
    </span>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-black uppercase tracking-wide text-cool-slate">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold leading-6 text-navy">{value || 'Not provided'}</dd>
    </div>
  )
}

function formatTruckTrailer(application) {
  const trailer = application.trailer_type?.startsWith('Not applicable')
    ? 'Not applicable'
    : application.trailer_type || 'Not provided'

  return `${application.truck_type || 'Not provided'} / ${trailer}`
}

function DocumentStatusBadge({ status }) {
  const normalizedStatus = status || 'not_requested'
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${
        documentStatusStyles[normalizedStatus] || documentStatusStyles.not_requested
      }`}
    >
      {formatStatus(normalizedStatus)}
    </span>
  )
}

function DocumentRow({ document, onUpdated }) {
  const [status, setStatus] = useState(document.status || 'not_requested')
  const [notes, setNotes] = useState(document.notes || '')
  const [expiresAt, setExpiresAt] = useState(document.expires_at || '')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const supportsExpiry = expiringDocumentTypes.has(document.document_type)

  async function saveDocument() {
    setSaving(true)
    setFeedback(null)

    const result = await updateDocumentRecord(document.id, {
      status,
      notes: notes.trim() || null,
      expires_at: supportsExpiry ? expiresAt || null : undefined,
    })
    setSaving(false)

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message })
      return
    }

    onUpdated(result.data)
    setFeedback({ type: 'success', text: 'Document updated.' })
  }

  return (
    <article className="rounded-lg border border-light-steel/70 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h4 className="font-black text-navy">{documentLabels[document.document_type] || document.document_type}</h4>
          <p className="mt-1 text-xs text-cool-slate">Tracking only. Secure upload is not enabled.</p>
        </div>
        <DocumentStatusBadge status={status} />
      </div>

      <div className={`mt-4 grid gap-3 ${supportsExpiry ? 'sm:grid-cols-2' : ''}`}>
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-wide text-steel">Status</span>
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
            {documentStatuses.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </select>
        </label>
        {supportsExpiry ? (
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-steel">Expiry date</span>
            <input
              className="field"
              type="date"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </label>
        ) : null}
      </div>

      <label className="mt-3 grid gap-2">
        <span className="text-xs font-black uppercase tracking-wide text-steel">Admin notes</span>
        <textarea
          className="field min-h-24 resize-y"
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Document follow-up notes"
        />
      </label>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <div className="min-h-5 text-xs font-bold">
          {feedback ? (
            <span className={feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {feedback.text}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={saveDocument}
          disabled={saving}
          className="min-h-10 rounded-lg border border-royal px-4 text-sm font-bold text-royal transition hover:bg-royal hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/15 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save document'}
        </button>
      </div>
    </article>
  )
}

function DocumentChecklist({ applicationId }) {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let active = true

    async function loadChecklist() {
      setLoading(true)
      setError(null)
      const result = await upsertDocumentChecklist(applicationId)
      if (!active) return

      if (!result.ok) {
        setError(result.message)
        setLoading(false)
        return
      }

      setDocuments(result.data)
      setLoading(false)
    }

    loadChecklist()
    return () => {
      active = false
    }
  }, [applicationId])

  function handleDocumentUpdated(updatedDocument) {
    setDocuments((current) =>
      current.map((document) => (document.id === updatedDocument.id ? updatedDocument : document)),
    )
  }

  return (
    <section className="mt-8">
      <div className="border-b border-light-steel/70 pb-3">
        <div className="flex items-center gap-2">
          <FileCheck2 className="h-5 w-5 text-royal" aria-hidden="true" />
          <h3 className="text-sm font-black uppercase tracking-wide text-navy">Onboarding Documents</h3>
        </div>
        <p className="mt-2 text-sm leading-6 text-steel">
          Track required documents for this owner-operator. Sensitive documents should only be collected
          through a secure upload flow.
        </p>
      </div>

      <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
        <ShieldAlert className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
        <p>Do not store Social Security numbers in notes. Use secure document upload once enabled.</p>
      </div>

      {loading ? <p className="mt-4 text-sm font-semibold text-steel">Preparing document checklist...</p> : null}
      {error ? (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">
          {error}
        </div>
      ) : null}
      {!loading && !error ? (
        <div className="mt-4 grid gap-3">
          {documents.map((document) => (
            <DocumentRow key={document.id} document={document} onUpdated={handleDocumentUpdated} />
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ApplicationDrawer({ application, onClose, onUpdated }) {
  const [status, setStatus] = useState(application.status || 'new')
  const [adminNotes, setAdminNotes] = useState(application.admin_notes || '')
  const [savedStatus, setSavedStatus] = useState(application.status || 'new')
  const [savedNotes, setSavedNotes] = useState(application.admin_notes || '')
  const [feedback, setFeedback] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose()
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  async function saveChanges() {
    setSaving(true)
    setFeedback(null)

    const statusChanged = status !== savedStatus
    const normalizedNotes = adminNotes.trim()
    const notesChanged = normalizedNotes !== savedNotes

    if (!statusChanged && !notesChanged) {
      setSaving(false)
      setFeedback({ type: 'success', text: 'Application updated.' })
      return
    }

    const results = await Promise.all([
      statusChanged ? updateDriverApplicationStatus(application.id, status) : Promise.resolve({ ok: true }),
      notesChanged
        ? updateDriverApplicationNotes(application.id, normalizedNotes)
        : Promise.resolve({ ok: true }),
    ])

    const failedResult = results.find((result) => !result.ok)
    setSaving(false)

    if (failedResult) {
      const isAccessError = ['admin_not_configured', 'not_authorized'].includes(failedResult.code)
      setFeedback({
        type: 'error',
        text: isAccessError ? 'Admin updates require authorized access.' : failedResult.message,
      })
      return
    }

    const updatedApplication = {
      ...application,
      status,
      admin_notes: normalizedNotes || null,
    }
    setSavedStatus(status)
    setSavedNotes(normalizedNotes)
    onUpdated(updatedApplication)
    setFeedback({ type: 'success', text: 'Application updated.' })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-navy/50 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-drawer-title"
    >
      <button
        type="button"
        className="hidden flex-1 cursor-default sm:block"
        onClick={onClose}
        aria-label="Close application details"
      />
      <section className="flex h-full w-full flex-col bg-white shadow-2xl sm:w-[580px] sm:max-w-[calc(100vw-2rem)]">
        <header className="sticky top-0 z-10 flex flex-none items-start justify-between gap-4 border-b border-light-steel/70 bg-white px-5 py-5 sm:px-7">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-wide text-royal">Driver application</p>
              <StatusBadge status={status} />
            </div>
            <h2 id="application-drawer-title" className="mt-2 truncate text-2xl font-black text-navy sm:text-3xl">
              {application.full_name}
            </h2>
            <p className="mt-1 text-sm text-steel">Submitted {formatDate(application.created_at, true)}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-11 w-11 flex-none items-center justify-center rounded-lg border border-light-steel text-navy transition hover:bg-off-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/20"
            aria-label="Close application details"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          <section>
            <h3 className="border-b border-light-steel/70 pb-3 text-sm font-black uppercase tracking-wide text-navy">
              Contact
            </h3>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <DetailItem label="Phone" value={application.phone} />
              <DetailItem label="Email" value={application.email} />
              <DetailItem
                label="City / State"
                value={[application.city, application.state].filter(Boolean).join(', ')}
              />
            </dl>
          </section>

          <section className="mt-8">
            <h3 className="border-b border-light-steel/70 pb-3 text-sm font-black uppercase tracking-wide text-navy">
              Truck & Driver Info
            </h3>
            <dl className="mt-4 grid gap-5 sm:grid-cols-2">
              <DetailItem label="Truck type" value={application.truck_type} />
              <DetailItem label="Trailer type" value={application.trailer_type} />
              <DetailItem label="Years of experience" value={application.years_experience} />
              <DetailItem label="CDL status" value={application.cdl_status} />
              <DetailItem label="Insurance status" value={application.insurance_status} />
              <DetailItem label="Preferred routes" value={application.preferred_routes} />
              <DetailItem label="Availability" value={application.availability} />
            </dl>
          </section>

          <section className="mt-8">
            <h3 className="border-b border-light-steel/70 pb-3 text-sm font-black uppercase tracking-wide text-navy">
              Message from applicant
            </h3>
            <p className="mt-4 whitespace-pre-wrap rounded-lg border border-light-steel/70 bg-off-white p-4 text-sm leading-7 text-steel">
              {application.message || 'No message provided.'}
            </p>
          </section>

          <DocumentChecklist applicationId={application.id} />

          <section className="mt-8 rounded-lg border border-royal/20 bg-blue-50/60 p-5">
            <p className="text-xs font-black uppercase tracking-wide text-royal">Admin Management</p>
            <div className="mt-4 grid gap-5">
              <label className="grid gap-2">
                <span className="text-sm font-black text-navy">Status</span>
                <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {statuses.map((item) => (
                    <option key={item} value={item}>
                      {formatStatus(item)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-black text-navy">Admin notes</span>
                <textarea
                  className="field min-h-36 resize-y"
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  placeholder="Add internal follow-up notes..."
                />
              </label>
            </div>
          </section>
        </div>

        <footer className="sticky bottom-0 z-10 flex-none border-t border-light-steel/70 bg-white px-5 py-4 shadow-[0_-8px_24px_rgba(0,29,68,0.06)] sm:px-7">
          {feedback ? (
            <div
              className={`mb-3 rounded-lg border px-3 py-2 text-sm font-bold ${
                feedback.type === 'success'
                  ? 'border-green-200 bg-green-50 text-green-800'
                  : 'border-red-200 bg-red-50 text-red-800'
              }`}
              role="status"
            >
              {feedback.text}
            </div>
          ) : null}
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3">
            <button
              type="button"
              onClick={saveChanges}
              disabled={saving}
              className="min-h-12 rounded-lg bg-royal px-5 font-bold text-white transition hover:bg-navy focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? 'Saving changes...' : 'Save changes'}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="min-h-12 rounded-lg border border-light-steel bg-white px-5 font-bold text-navy transition hover:bg-off-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/15 disabled:opacity-60"
            >
              Close
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

export function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [truckFilter, setTruckFilter] = useState('')
  const [selectedApplication, setSelectedApplication] = useState(null)

  useEffect(() => {
    let active = true

    async function loadApplications() {
      const result = await fetchDriverApplications()
      if (!active) return

      if (!result.ok) {
        setLoadError(result)
        setLoading(false)
        return
      }

      setApplications(result.data)
      setLoading(false)
    }

    loadApplications()
    return () => {
      active = false
    }
  }, [])

  const filteredApplications = useMemo(() => {
    const query = search.trim().toLowerCase()

    return applications.filter((application) => {
      const matchesSearch =
        !query ||
        [application.full_name, application.phone, application.city, application.state]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))
      const matchesStatus = !statusFilter || application.status === statusFilter
      const matchesTruck = !truckFilter || application.truck_type === truckFilter

      return matchesSearch && matchesStatus && matchesTruck
    })
  }, [applications, search, statusFilter, truckFilter])

  const hasFilters = Boolean(search || statusFilter || truckFilter)

  function clearFilters() {
    setSearch('')
    setStatusFilter('')
    setTruckFilter('')
  }

  function handleUpdated(updatedApplication) {
    setApplications((current) =>
      current.map((item) => (item.id === updatedApplication.id ? updatedApplication : item)),
    )
    setSelectedApplication(updatedApplication)
  }

  return (
    <section className="w-full max-w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <div className="mx-auto w-full max-w-[1440px]">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-royal">Application management</p>
            <h1 className="mt-2 text-3xl font-black text-navy sm:text-4xl">Driver Applications</h1>
            <p className="mt-2 max-w-2xl leading-7 text-steel">
              Review, filter, and manage owner-operator applications submitted through the website.
            </p>
          </div>
          {!loading && !loadError ? (
            <p className="inline-flex w-fit rounded-full border border-light-steel/70 bg-white px-3 py-1.5 text-sm font-bold text-steel shadow-sm">
              {applications.length} total application{applications.length === 1 ? '' : 's'}
            </p>
          ) : null}
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statDefinitions.map((stat) => {
            const Icon = stat.icon
            const count = applications.filter((item) => (item.status || 'new') === stat.status).length
            return (
              <div
                key={stat.status}
                className={`relative overflow-hidden rounded-lg border border-t-4 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft ${stat.accent.split(' ')[0]}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-3xl font-black text-navy">{count}</p>
                    <p className="mt-1 text-sm font-black text-steel">{stat.label}</p>
                  </div>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${stat.accent}`}>
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {loadError ? (
          <div className="mt-7 rounded-lg border border-royal/20 bg-white p-6 shadow-soft">
            <div className="flex items-start gap-4">
              <AlertCircle className="mt-1 h-7 w-7 flex-none text-royal" aria-hidden="true" />
              <div>
                <h2 className="text-xl font-black text-navy">Admin access is not configured yet.</h2>
                <p className="mt-2 max-w-3xl leading-7 text-steel">
                  Application submissions are being saved, but admin read access requires Supabase Auth and
                  admin policies.
                </p>
                <p className="mt-3 text-sm font-semibold text-steel">{loadError.message}</p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="mt-7 rounded-lg border border-light-steel/70 bg-white p-3 shadow-sm sm:p-4">
              <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_210px_210px_auto]">
                <label className="relative block min-w-0">
                  <Search
                    className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-steel"
                    aria-hidden="true"
                  />
                  <input
                    className="field pl-11"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search name, phone, city, state..."
                  />
                </label>
                <select
                  className="field"
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by status"
                >
                  <option value="">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
                <select
                  className="field"
                  value={truckFilter}
                  onChange={(event) => setTruckFilter(event.target.value)}
                  aria-label="Filter by truck type"
                >
                  <option value="">All truck types</option>
                  {currentTruckTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={clearFilters}
                  disabled={!hasFilters}
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-light-steel bg-white px-4 text-sm font-bold text-navy transition hover:bg-off-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/15 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <FilterX className="h-4 w-4" aria-hidden="true" />
                  Clear filters
                </button>
              </div>
              {hasFilters ? (
                <p className="mt-3 text-xs font-bold text-steel">
                  Showing {filteredApplications.length} of {applications.length} applications
                </p>
              ) : null}
            </div>

            <div className="mt-5 overflow-hidden rounded-lg border border-light-steel/70 bg-white shadow-soft">
              {loading ? (
                <div className="p-10 text-center font-semibold text-steel">Loading applications...</div>
              ) : filteredApplications.length === 0 ? (
                <div className="px-6 py-14 text-center">
                  {hasFilters ? (
                    <Search className="mx-auto h-10 w-10 text-cool-slate" aria-hidden="true" />
                  ) : (
                    <Inbox className="mx-auto h-10 w-10 text-royal" aria-hidden="true" />
                  )}
                  <h2 className="mt-4 text-xl font-black text-navy">
                    {hasFilters ? 'No matching applications' : 'No driver applications yet'}
                  </h2>
                  <p className="mx-auto mt-2 max-w-lg text-steel">
                    {hasFilters
                      ? 'Adjust or clear the filters to see other applications.'
                      : 'Applications submitted from the public Apply page will appear here.'}
                  </p>
                  {hasFilters ? (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="mt-5 min-h-11 rounded-lg bg-navy px-5 font-bold text-white hover:bg-navy-dark"
                    >
                      Clear filters
                    </button>
                  ) : null}
                </div>
              ) : (
                <>
                  <div className="grid gap-3 p-4 lg:hidden">
                    {filteredApplications.map((application) => (
                      <article key={application.id} className="rounded-lg border border-light-steel/70 bg-off-white p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h2 className="truncate font-black text-navy">{application.full_name}</h2>
                            <p className="mt-1 text-sm text-steel">{application.phone}</p>
                          </div>
                          <StatusBadge status={application.status} />
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-4 text-sm">
                          <DetailItem
                            label="Location"
                            value={[application.city, application.state].filter(Boolean).join(', ')}
                          />
                          <DetailItem
                            label="Truck / Trailer"
                            value={formatTruckTrailer(application)}
                          />
                          <DetailItem label="CDL" value={application.cdl_status} />
                          <DetailItem label="Submitted" value={formatDate(application.created_at)} />
                        </dl>
                        <button
                          type="button"
                          onClick={() => setSelectedApplication(application)}
                          className="mt-4 min-h-11 w-full rounded-lg bg-navy px-4 font-bold text-white transition hover:bg-navy-dark"
                        >
                          View application
                        </button>
                      </article>
                    ))}
                  </div>

                  <div className="hidden overflow-x-auto lg:block">
                    <table className="w-full min-w-[1180px] border-collapse text-left text-sm">
                      <thead className="border-b border-light-steel/70 bg-off-white text-xs uppercase tracking-wide text-steel">
                        <tr>
                          {[
                            'Applicant',
                            'Contact',
                            'Location',
                            'Truck / Trailer',
                            'Driver Status',
                            'Preferred Route',
                            'Application Status',
                            'Submitted',
                            'Action',
                          ].map((heading) => (
                            <th key={heading} className="px-4 py-3.5 font-black">
                              {heading}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredApplications.map((application) => (
                          <tr
                            key={application.id}
                            className="border-b border-light-steel/50 transition last:border-b-0 hover:bg-blue-50/40"
                          >
                            <td className="px-4 py-4">
                              <p className="font-black text-navy">{application.full_name}</p>
                              <p className="mt-1 max-w-44 truncate text-xs text-cool-slate">
                                {application.email || 'No email'}
                              </p>
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 font-semibold text-steel">
                              {application.phone}
                            </td>
                            <td className="px-4 py-4 text-steel">
                              {[application.city, application.state].filter(Boolean).join(', ')}
                            </td>
                            <td className="px-4 py-4 text-steel">
                              <p className="font-bold text-navy">{application.truck_type}</p>
                              <p className="mt-1 text-xs text-cool-slate">
                                {application.trailer_type || 'Not provided'}
                              </p>
                            </td>
                            <td className="px-4 py-4 text-steel">{application.cdl_status}</td>
                            <td className="px-4 py-4 text-steel">
                              {application.preferred_routes || 'Not provided'}
                            </td>
                            <td className="px-4 py-4">
                              <StatusBadge status={application.status} />
                            </td>
                            <td className="whitespace-nowrap px-4 py-4 text-steel">
                              {formatDate(application.created_at)}
                            </td>
                            <td className="px-4 py-4">
                              <button
                                type="button"
                                onClick={() => setSelectedApplication(application)}
                                className="min-h-9 rounded-lg border border-light-steel bg-white px-3 text-sm font-bold text-navy transition hover:border-navy hover:bg-navy hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/15"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>

      {selectedApplication ? (
        <ApplicationDrawer
          application={selectedApplication}
          onClose={() => setSelectedApplication(null)}
          onUpdated={handleUpdated}
        />
      ) : null}
    </section>
  )
}
