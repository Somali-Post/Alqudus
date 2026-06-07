import { useEffect, useMemo, useState } from 'react'
import {
  AlertCircle,
  ClipboardList,
  FileClock,
  FilterX,
  Inbox,
  PhoneCall,
  Search,
  UserCheck,
  UserX,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { fetchDriverApplications } from '../../services/adminApplicationService'

const statuses = [
  'new',
  'contacted',
  'documents_requested',
  'approved',
  'rejected',
  'inactive',
]

const currentTruckTypes = ['Semi truck', 'Box truck', 'Power Only', 'Other']

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

function formatDate(value) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function StatusBadge({ status }) {
  const normalizedStatus = status || 'new'
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${
        statusStyles[normalizedStatus] || statusStyles.inactive
      }`}
    >
      {formatStatus(normalizedStatus)}
    </span>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs font-black uppercase tracking-wide text-cool-slate">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold leading-6 text-navy">
        {value || 'Not provided'}
      </dd>
    </div>
  )
}

function formatTruckTrailer(application) {
  const trailer = application.trailer_type?.startsWith('Not applicable')
    ? 'Not applicable'
    : application.trailer_type || 'Not provided'

  return `${application.truck_type || 'Not provided'} / ${trailer}`
}

export function AdminApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [truckFilter, setTruckFilter] = useState('')

  useEffect(() => {
    let active = true

    async function loadApplications() {
      const result = await fetchDriverApplications()
      if (!active) return

      if (!result.ok) {
        setLoadError(result)
      } else {
        setApplications(result.data)
      }
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
                          <DetailItem label="Truck / Trailer" value={formatTruckTrailer(application)} />
                          <DetailItem label="CDL" value={application.cdl_status} />
                          <DetailItem label="Submitted" value={formatDate(application.created_at)} />
                        </dl>
                        <Link
                          to={`/admin/applications/${application.id}`}
                          className="mt-4 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-navy px-4 font-bold text-white transition hover:bg-navy-dark"
                        >
                          View application
                        </Link>
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
                                {application.trailer_type?.startsWith('Not applicable')
                                  ? 'Not applicable'
                                  : application.trailer_type || 'Not provided'}
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
                              <Link
                                to={`/admin/applications/${application.id}`}
                                className="inline-flex min-h-9 items-center justify-center rounded-lg border border-light-steel bg-white px-3 text-sm font-bold text-navy transition hover:border-navy hover:bg-navy hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-royal/15"
                              >
                                View
                              </Link>
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
    </section>
  )
}
