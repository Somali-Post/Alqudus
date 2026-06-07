import { useEffect, useMemo, useState } from 'react'
import {
  ArrowLeft,
  Ban,
  Copy,
  Download,
  FileCheck2,
  Link2,
  Mail,
  MessageCircle,
  MessageSquareText,
  RefreshCw,
  Save,
  ShieldAlert,
} from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import {
  fetchDriverApplication,
  updateDriverApplicationNotes,
  updateDriverApplicationStatus,
} from '../../services/adminApplicationService'
import {
  fetchDocumentsForApplication,
  upsertDocumentChecklist,
  updateDocumentRecord,
} from '../../services/documentService'
import { getDocumentDownloadUrl } from '../../services/documentDownloadService'
import { sendDocumentRequestEmail } from '../../services/emailService'
import {
  fetchUploadTokensForApplication,
  generateUploadToken,
  revokeUploadToken,
} from '../../services/uploadTokenService'

const applicationStatuses = [
  'new',
  'contacted',
  'documents_requested',
  'approved',
  'rejected',
  'inactive',
]

const documentStatuses = [
  'not_requested',
  'requested',
  'received',
  'approved',
  'rejected',
  'expired',
]

const requestReadyStatuses = new Set(['requested', 'rejected', 'expired'])
const commonDocumentTypes = new Set([
  'drivers_license_front',
  'drivers_license_back',
  'insurance',
  'w9_tax_form',
])

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

const applicationStatusStyles = {
  new: 'border-blue-200 bg-blue-50 text-blue-800',
  contacted: 'border-slate-200 bg-slate-100 text-slate-700',
  documents_requested: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-green-200 bg-green-50 text-green-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  inactive: 'border-slate-200 bg-slate-100 text-slate-600',
}

const documentStatusStyles = {
  not_requested: 'border-slate-200 bg-slate-100 text-slate-700',
  requested: 'border-blue-200 bg-blue-50 text-blue-800',
  received: 'border-amber-200 bg-amber-50 text-amber-800',
  approved: 'border-green-200 bg-green-50 text-green-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  expired: 'border-red-200 bg-red-50 text-red-800',
}

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

function StatusBadge({ status, document = false }) {
  const normalizedStatus = status || (document ? 'not_requested' : 'new')
  const styles = document ? documentStatusStyles : applicationStatusStyles

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${
        styles[normalizedStatus] || styles.inactive || styles.not_requested
      }`}
    >
      {formatStatus(normalizedStatus)}
    </span>
  )
}

function DetailItem({ label, value, wide = false }) {
  return (
    <div className={wide ? 'sm:col-span-2' : ''}>
      <dt className="text-xs font-black uppercase tracking-wide text-cool-slate">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold leading-6 text-navy">
        {value || 'Not provided'}
      </dd>
    </div>
  )
}

function Feedback({ feedback }) {
  if (!feedback) return null

  return (
    <p
      className={`rounded-lg border px-3 py-2 text-sm font-bold ${
        feedback.type === 'success'
          ? 'border-green-200 bg-green-50 text-green-800'
          : 'border-red-200 bg-red-50 text-red-800'
      }`}
      role="status"
    >
      {feedback.text}
    </p>
  )
}

function DocumentCard({ document, onUpdated }) {
  const [status, setStatus] = useState(document.status || 'not_requested')
  const [notes, setNotes] = useState(document.notes || '')
  const [expiresAt, setExpiresAt] = useState(document.expires_at?.slice(0, 10) || '')
  const [saving, setSaving] = useState(false)
  const [openingDocument, setOpeningDocument] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const supportsExpiry = expiringDocumentTypes.has(document.document_type)

  useEffect(() => {
    setStatus(document.status || 'not_requested')
    setNotes(document.notes || '')
    setExpiresAt(document.expires_at?.slice(0, 10) || '')
  }, [document])

  const dirty =
    status !== (document.status || 'not_requested') ||
    notes.trim() !== (document.notes || '') ||
    (supportsExpiry && expiresAt !== (document.expires_at?.slice(0, 10) || ''))

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
    setFeedback({ type: 'success', text: 'Saved.' })
  }

  async function openDocument() {
    if (!document.file_path || openingDocument) return

    const documentTab = window.open('about:blank', '_blank')
    if (documentTab) documentTab.opener = null
    setOpeningDocument(true)
    setFeedback(null)
    const result = await getDocumentDownloadUrl(document.id)
    setOpeningDocument(false)

    if (!result.ok) {
      documentTab?.close()
      setFeedback({ type: 'error', text: 'Could not open document.' })
      return
    }

    if (documentTab) {
      documentTab.location.href = result.signedUrl
    } else {
      setFeedback({
        type: 'error',
        text: 'Could not open document. Allow pop-ups for this admin site and try again.',
      })
    }
  }

  return (
    <article className="rounded-lg border border-light-steel/70 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="font-black text-navy">
            {documentLabels[document.document_type] || document.document_type}
          </h3>
          <p className="mt-1 text-xs font-semibold text-cool-slate">
            {document.file_path
              ? `File received: ${document.file_name || 'Uploaded document'}`
              : 'No file received yet.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty ? <span className="text-xs font-black text-amber-700">Unsaved</span> : null}
          <StatusBadge status={status} document />
        </div>
      </div>

      {document.file_path ? (
        <div className="mt-3">
          <button
            type="button"
            onClick={openDocument}
            disabled={openingDocument}
            className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-royal bg-white px-4 text-sm font-bold text-royal transition hover:bg-royal hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {openingDocument ? 'Preparing...' : 'View / Download'}
          </button>
        </div>
      ) : (
        <button
          type="button"
          disabled
          className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-lg border border-light-steel bg-off-white px-4 text-sm font-bold text-cool-slate disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          No file uploaded
        </button>
      )}

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

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-light-steel/60 pt-4">
        <div className="min-h-6">
          {feedback ? (
            <span className={`text-xs font-bold ${feedback.type === 'success' ? 'text-green-700' : 'text-red-700'}`}>
              {feedback.text}
            </span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={saveDocument}
          disabled={saving || !dirty}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-royal px-4 text-sm font-bold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? 'Saving...' : 'Save document'}
        </button>
      </div>
    </article>
  )
}

function ApplicationManagement({ application, onUpdated }) {
  const [status, setStatus] = useState(application.status || 'new')
  const [adminNotes, setAdminNotes] = useState(application.admin_notes || '')
  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState(null)

  async function saveApplication() {
    setSaving(true)
    setFeedback(null)

    const normalizedNotes = adminNotes.trim()
    const results = await Promise.all([
      status !== (application.status || 'new')
        ? updateDriverApplicationStatus(application.id, status)
        : Promise.resolve({ ok: true }),
      normalizedNotes !== (application.admin_notes || '')
        ? updateDriverApplicationNotes(application.id, normalizedNotes)
        : Promise.resolve({ ok: true }),
    ])
    setSaving(false)

    const failed = results.find((result) => !result.ok)
    if (failed) {
      setFeedback({
        type: 'error',
        text: ['admin_not_configured', 'not_authorized'].includes(failed.code)
          ? 'Admin updates require authorized access.'
          : failed.message,
      })
      return
    }

    onUpdated({
      ...application,
      status,
      admin_notes: normalizedNotes || null,
    })
    setFeedback({ type: 'success', text: 'Application updated.' })
  }

  return (
    <section className="rounded-lg border border-light-steel/70 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-wide text-royal">Application Management</p>
      <div className="mt-4 grid gap-4">
        <label className="grid gap-2">
          <span className="text-sm font-black text-navy">Application status</span>
          <select className="field" value={status} onChange={(event) => setStatus(event.target.value)}>
            {applicationStatuses.map((item) => (
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
        <Feedback feedback={feedback} />
        <button
          type="button"
          onClick={saveApplication}
          disabled={saving}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-navy px-5 font-bold text-white transition hover:bg-navy-dark disabled:opacity-60"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          {saving ? 'Saving application...' : 'Save application'}
        </button>
      </div>
    </section>
  )
}

function UploadLinkPanel({ application, requestedDocumentCount }) {
  const [tokens, setTokens] = useState([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [emailSending, setEmailSending] = useState(false)
  const [feedback, setFeedback] = useState(null)
  const canSendRequest = requestedDocumentCount > 0

  useEffect(() => {
    let active = true

    async function loadTokens() {
      const result = await fetchUploadTokensForApplication(application.id)
      if (!active) return

      if (!result.ok) {
        setFeedback({ type: 'error', text: result.message })
      } else {
        setTokens(result.data)
      }
      setLoading(false)
    }

    loadTokens()
    return () => {
      active = false
    }
  }, [application.id])

  const activeToken = tokens.find(
    (item) => !item.is_revoked && new Date(item.expires_at).getTime() > Date.now(),
  )

  function messageTemplates() {
    if (!activeToken) return null
    const driverName = application.full_name || 'Driver'
    const expiryDate = formatDate(activeToken.expires_at)
    const fullMessage = `Hello ${driverName},

Alqudus Express Trucking has reviewed your application. Please upload your requested onboarding documents using the secure link below:

${activeToken.url}

This link expires on ${expiryDate}.

Thank you,
Alqudus Express Trucking LLC`

    return {
      whatsapp: fullMessage,
      sms: `Hello ${driverName}, Alqudus Express Trucking needs your onboarding documents. Upload them securely here: ${activeToken.url}. Link expires ${expiryDate}.`,
      email: `Subject: Document Request - Alqudus Express Trucking

${fullMessage}`,
    }
  }

  async function copyText(text, successText) {
    try {
      await navigator.clipboard.writeText(text)
      setFeedback({ type: 'success', text: successText })
    } catch {
      setFeedback({ type: 'error', text: 'Copy failed. Select and copy the link manually.' })
    }
  }

  async function generateLink() {
    setWorking(true)
    setFeedback(null)
    const result = await generateUploadToken(application.id)
    setWorking(false)

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message })
      return
    }

    setTokens((current) => [{ ...result.data, url: result.url }, ...current])
    setFeedback({ type: 'success', text: 'Secure upload link generated.' })
  }

  async function revokeLink() {
    if (!activeToken) return
    setWorking(true)
    setFeedback(null)
    const result = await revokeUploadToken(activeToken.id)
    setWorking(false)

    if (!result.ok) {
      setFeedback({ type: 'error', text: result.message })
      return
    }

    setTokens((current) =>
      current.map((item) => (item.id === result.data.id ? { ...item, ...result.data } : item)),
    )
    setFeedback({ type: 'success', text: 'Upload link revoked.' })
  }

  async function sendEmail() {
    if (!activeToken || !application.email || !canSendRequest) return
    setEmailSending(true)
    setFeedback(null)
    const result = await sendDocumentRequestEmail({
      applicationId: application.id,
      uploadLink: activeToken.url,
      expiresAt: activeToken.expires_at,
    })
    setEmailSending(false)
    setFeedback({
      type: result.ok ? 'success' : 'error',
      text: result.ok ? 'Email sent.' : 'Email could not be sent.',
    })
  }

  const templates = messageTemplates()

  return (
    <section className="rounded-lg border border-royal/20 bg-blue-50/60 p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Link2 className="h-5 w-5 text-royal" aria-hidden="true" />
        <h2 className="font-black text-navy">Secure Upload Link</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-steel">
        Generate a private link for this driver. Links expire after 14 days.
      </p>

      {!canSendRequest ? (
        <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold leading-6 text-amber-900">
          <ShieldAlert className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
          <p>Request at least one document before sending the upload link.</p>
        </div>
      ) : (
        <p className="mt-4 text-sm font-bold text-green-700">
          {requestedDocumentCount} saved document request{requestedDocumentCount === 1 ? '' : 's'} ready.
        </p>
      )}

      {loading ? <p className="mt-4 text-sm font-semibold text-steel">Loading upload links...</p> : null}

      {!activeToken && !loading ? (
        <button
          type="button"
          onClick={generateLink}
          disabled={working}
          className="mt-4 min-h-11 w-full rounded-lg bg-royal px-4 text-sm font-bold text-white transition hover:bg-navy disabled:opacity-60"
        >
          {working ? 'Generating...' : 'Generate upload link'}
        </button>
      ) : null}

      {activeToken ? (
        <div className="mt-4 rounded-lg border border-light-steel/70 bg-white p-4">
          <p className="text-xs font-black uppercase tracking-wide text-steel">Active link</p>
          <input className="field mt-2" value={activeToken.url} readOnly aria-label="Active secure upload link" />
          <p className="mt-2 text-xs font-semibold text-steel">
            Expires {formatDate(activeToken.expires_at, true)}
          </p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => copyText(activeToken.url, 'Upload link copied.')}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-royal px-3 text-sm font-bold text-royal hover:bg-royal hover:text-white"
            >
              <Copy className="h-4 w-4" aria-hidden="true" />
              Copy link
            </button>
            <button
              type="button"
              onClick={revokeLink}
              disabled={working}
              className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
            >
              <Ban className="h-4 w-4" aria-hidden="true" />
              {working ? 'Revoking...' : 'Revoke'}
            </button>
          </div>

          <div className="mt-5 border-t border-light-steel/70 pt-4">
            <h3 className="font-black text-navy">Send request to driver</h3>
            <p className="mt-1 text-xs leading-5 text-steel">
              Send this upload link after selecting and saving requested documents.
            </p>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                disabled={!canSendRequest}
                onClick={() => copyText(templates.whatsapp, 'Message copied.')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-light-steel bg-white px-3 text-sm font-bold text-navy hover:border-royal hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <MessageCircle className="h-4 w-4 text-royal" aria-hidden="true" />
                Copy WhatsApp message
              </button>
              <button
                type="button"
                disabled={!canSendRequest}
                onClick={() => copyText(templates.sms, 'Message copied.')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-light-steel bg-white px-3 text-sm font-bold text-navy hover:border-royal hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <MessageSquareText className="h-4 w-4 text-royal" aria-hidden="true" />
                Copy SMS message
              </button>
              <button
                type="button"
                disabled={!canSendRequest}
                onClick={() => copyText(templates.email, 'Message copied.')}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-light-steel bg-white px-3 text-sm font-bold text-navy hover:border-royal hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-45"
              >
                <Mail className="h-4 w-4 text-royal" aria-hidden="true" />
                Copy Email message
              </button>
            </div>
            <button
              type="button"
              onClick={sendEmail}
              disabled={!canSendRequest || !application.email || emailSending}
              title={application.email ? 'Send document request email' : 'Applicant has no email address on file'}
              className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-royal px-4 text-sm font-bold text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-45"
            >
              <Mail className="h-4 w-4" aria-hidden="true" />
              {emailSending ? 'Sending...' : 'Send email request'}
            </button>
            <p className="mt-2 text-xs text-steel">Email sending uses the applicant email on file.</p>
          </div>
        </div>
      ) : null}

      <div className="mt-3">
        <Feedback feedback={feedback} />
      </div>
    </section>
  )
}

export function AdminApplicationDetailPage() {
  const { id } = useParams()
  const [application, setApplication] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  const [bulkSaving, setBulkSaving] = useState(false)
  const [refreshingDocuments, setRefreshingDocuments] = useState(false)
  const [bulkFeedback, setBulkFeedback] = useState(null)

  useEffect(() => {
    let active = true

    async function loadPage() {
      setLoading(true)
      setLoadError(null)

      const applicationResult = await fetchDriverApplication(id)
      if (!active) return
      if (!applicationResult.ok) {
        setLoadError(applicationResult.message)
        setLoading(false)
        return
      }

      setApplication(applicationResult.data)
      const documentsResult = await upsertDocumentChecklist(id)
      if (!active) return

      if (!documentsResult.ok) {
        setLoadError(documentsResult.message)
        setLoading(false)
        return
      }

      setDocuments(documentsResult.data)
      setLoading(false)
    }

    loadPage()
    return () => {
      active = false
    }
  }, [id])

  const requestedDocumentCount = useMemo(
    () => documents.filter((document) => requestReadyStatuses.has(document.status)).length,
    [documents],
  )

  function handleDocumentUpdated(updatedDocument) {
    setDocuments((current) =>
      current.map((document) => (document.id === updatedDocument.id ? updatedDocument : document)),
    )
  }

  async function refreshDocuments({ showFeedback = true } = {}) {
    setRefreshingDocuments(true)
    if (showFeedback) setBulkFeedback(null)

    const result = await fetchDocumentsForApplication(id)
    setRefreshingDocuments(false)

    if (!result.ok) {
      if (showFeedback) setBulkFeedback({ type: 'error', text: result.message })
      return result
    }

    setDocuments(result.data)
    if (showFeedback) {
      setBulkFeedback({ type: 'success', text: 'Documents refreshed.' })
    }
    return result
  }

  async function bulkRequest(mode) {
    const targets =
      mode === 'common'
        ? documents.filter((document) => commonDocumentTypes.has(document.document_type))
        : documents

    setBulkSaving(true)
    setBulkFeedback(null)
    const results = await Promise.all(
      targets.map((document) =>
        updateDocumentRecord(document.id, {
          status: 'requested',
          notes: document.notes || null,
          expires_at: document.expires_at || null,
        }),
      ),
    )

    const failed = results.find((result) => !result.ok)
    const refreshResult = await refreshDocuments({ showFeedback: false })
    setBulkSaving(false)

    if (failed) {
      setBulkFeedback({ type: 'error', text: failed.message })
      return
    }

    if (!refreshResult.ok) {
      setBulkFeedback({ type: 'error', text: refreshResult.message })
      return
    }

    setBulkFeedback({ type: 'success', text: 'Requested documents saved.' })
  }

  if (loading) {
    return <div className="px-4 py-10 text-center font-semibold text-steel">Loading application...</div>
  }

  if (loadError || !application) {
    return (
      <section className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-lg border border-red-200 bg-white p-6 shadow-soft">
          <h1 className="text-2xl font-black text-navy">Application unavailable</h1>
          <p className="mt-3 leading-7 text-steel">{loadError || 'The application could not be found.'}</p>
          <Link
            to="/admin/applications"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-lg bg-navy px-4 font-bold text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Applications
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="w-full max-w-full px-4 py-6 sm:px-6 lg:px-8 lg:py-9">
      <div className="mx-auto w-full max-w-[1440px]">
        <Link
          to="/admin/applications"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-bold text-royal hover:text-navy"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Applications
        </Link>

        <header className="mt-3 flex flex-col justify-between gap-4 border-b border-light-steel/70 pb-6 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-black uppercase tracking-wide text-royal">Driver Application</p>
              <StatusBadge status={application.status} />
            </div>
            <h1 className="mt-2 break-words text-3xl font-black text-navy sm:text-4xl">
              {application.full_name}
            </h1>
            <p className="mt-2 text-sm font-semibold text-steel">
              Submitted {formatDate(application.created_at, true)}
            </p>
          </div>
        </header>

        <div className="mt-7 grid min-w-0 gap-7 xl:grid-cols-[minmax(0,1fr)_390px]">
          <div className="min-w-0 space-y-7">
            <section className="rounded-lg border border-light-steel/70 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-black text-navy">Applicant Details</h2>
              <dl className="mt-5 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                <DetailItem label="Phone" value={application.phone} />
                <DetailItem label="Email" value={application.email} />
                <DetailItem
                  label="City / State"
                  value={[application.city, application.state].filter(Boolean).join(', ')}
                />
                <DetailItem label="Truck type" value={application.truck_type} />
                <DetailItem label="Trailer type" value={application.trailer_type} />
                <DetailItem label="Years of experience" value={application.years_experience} />
                <DetailItem label="CDL status" value={application.cdl_status} />
                <DetailItem label="Insurance status" value={application.insurance_status} />
                <DetailItem label="Preferred routes" value={application.preferred_routes} />
                <DetailItem label="Availability" value={application.availability} />
                <DetailItem label="Applicant message" value={application.message || 'No message provided.'} wide />
              </dl>
            </section>

            <section>
              <div className="rounded-lg border border-light-steel/70 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <FileCheck2 className="h-5 w-5 text-royal" aria-hidden="true" />
                      <h2 className="text-xl font-black text-navy">Onboarding Documents</h2>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-steel">
                      Request and track required documents for this owner-operator.
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:w-auto">
                    <button
                      type="button"
                      onClick={() => bulkRequest('common')}
                      disabled={bulkSaving}
                      className="min-h-11 rounded-lg bg-royal px-4 text-sm font-bold text-white transition hover:bg-navy disabled:opacity-60"
                    >
                      Mark common documents as requested
                    </button>
                    <button
                      type="button"
                      onClick={() => bulkRequest('all')}
                      disabled={bulkSaving}
                      className="min-h-11 rounded-lg border border-royal px-4 text-sm font-bold text-royal transition hover:bg-blue-50 disabled:opacity-60"
                    >
                      Request all documents
                    </button>
                    <button
                      type="button"
                      onClick={() => refreshDocuments()}
                      disabled={refreshingDocuments || bulkSaving}
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-light-steel px-4 text-sm font-bold text-navy transition hover:border-royal hover:bg-blue-50 disabled:opacity-60 sm:col-span-2"
                    >
                      <RefreshCw
                        className={`h-4 w-4 ${refreshingDocuments ? 'animate-spin' : ''}`}
                        aria-hidden="true"
                      />
                      {refreshingDocuments ? 'Refreshing...' : 'Refresh documents'}
                    </button>
                  </div>
                </div>

                <div className="mt-4 flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-900">
                  <ShieldAlert className="mt-0.5 h-5 w-5 flex-none" aria-hidden="true" />
                  <p>Do not store Social Security numbers in notes. Use the secure upload flow.</p>
                </div>
                <div className="mt-4">
                  <Feedback feedback={bulkFeedback} />
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {documents.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    onUpdated={handleDocumentUpdated}
                  />
                ))}
              </div>
            </section>
          </div>

          <aside className="min-w-0 space-y-5 xl:sticky xl:top-24 xl:self-start">
            <ApplicationManagement application={application} onUpdated={setApplication} />
            <UploadLinkPanel
              application={application}
              requestedDocumentCount={requestedDocumentCount}
            />
          </aside>
        </div>
      </div>
    </section>
  )
}
