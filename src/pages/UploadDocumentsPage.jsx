import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, ChevronDown, FileCheck2, LockKeyhole, ShieldCheck, UploadCloud } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import {
  uploadDriverDocument,
  validateDocumentUploadToken,
} from '../services/publicDocumentUploadService'

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

const requiredStatuses = new Set(['requested', 'rejected', 'expired'])
const completedStatuses = new Set(['received', 'approved'])

const statusStyles = {
  not_requested: 'border-slate-200 bg-slate-100 text-slate-700',
  requested: 'border-blue-200 bg-blue-50 text-blue-800',
  received: 'border-green-200 bg-green-50 text-green-800',
  approved: 'border-green-200 bg-green-50 text-green-800',
  rejected: 'border-red-200 bg-red-50 text-red-800',
  expired: 'border-amber-200 bg-amber-50 text-amber-800',
}

function formatStatus(status) {
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatDate(value) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

function StatusBadge({ status }) {
  const displayStatus = completedStatuses.has(status) ? 'Uploaded successfully' : formatStatus(status)

  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black ${statusStyles[status] || statusStyles.not_requested}`}>
      {displayStatus}
    </span>
  )
}

function DocumentUploadRow({
  document,
  selectedFile,
  rowState,
  onFileChange,
  disabled,
}) {
  const completed = completedStatuses.has(document.status)

  return (
    <article className={`rounded-lg border p-5 shadow-sm ${completed ? 'border-green-200 bg-green-50/40' : 'border-light-steel/70 bg-white'}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-black text-navy">{documentLabels[document.document_type] || 'Onboarding document'}</h2>
          <p className="mt-1 text-sm text-steel">PDF, JPG, or PNG</p>
        </div>
        <StatusBadge status={document.status} />
      </div>

      {completed ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-green-200 bg-white p-3 text-sm font-bold text-green-800">
          <CheckCircle2 className="h-5 w-5 flex-none" aria-hidden="true" />
          <div className="min-w-0">
            <p>Uploaded successfully</p>
            <p className="mt-1 break-all text-xs font-semibold text-green-700">
              {document.file_name || 'Document submitted'}
            </p>
          </div>
        </div>
      ) : (
        <>
          <label className="mt-4 block">
            <span className="sr-only">Choose file for {documentLabels[document.document_type]}</span>
            <input
              className="block w-full rounded-lg border border-light-steel bg-off-white p-3 text-sm text-navy file:mr-3 file:rounded-md file:border-0 file:bg-navy file:px-3 file:py-2 file:font-bold file:text-white disabled:opacity-60"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
              disabled={disabled}
              onChange={(event) => onFileChange(document.id, event.target.files?.[0] || null)}
            />
          </label>
          <p className="mt-2 min-h-5 break-all text-sm font-semibold text-steel">
            {selectedFile ? `Selected: ${selectedFile.name}` : requiredStatuses.has(document.status) ? 'File required' : 'Optional'}
          </p>
          {selectedFile && !rowState?.message ? (
            <p className="mt-1 text-sm font-bold text-royal">Ready to submit</p>
          ) : null}
        </>
      )}

      {rowState?.message ? (
        <p
          className={`mt-2 text-sm font-bold ${
            rowState.type === 'success'
              ? 'text-green-700'
              : rowState.type === 'progress'
                ? 'text-royal'
                : 'text-red-700'
          }`}
        >
          {rowState.message}
        </p>
      ) : null}
    </article>
  )
}

export function UploadDocumentsPage() {
  const { token } = useParams()
  const [state, setState] = useState({
    loading: true,
    error: null,
    expiresAt: null,
    applicantName: null,
    documents: [],
  })
  const [selectedFiles, setSelectedFiles] = useState({})
  const [rowStates, setRowStates] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({ current: 0, completed: 0, total: 0 })
  const [submissionMessage, setSubmissionMessage] = useState(null)
  const [showAdditional, setShowAdditional] = useState(false)

  useEffect(() => {
    let active = true

    async function validateToken() {
      const result = await validateDocumentUploadToken(token)
      if (!active) return

      if (!result.ok) {
        setState({
          loading: false,
          error: result.message,
          expiresAt: null,
          applicantName: null,
          documents: [],
        })
        return
      }

      setState({
        loading: false,
        error: null,
        expiresAt: result.expiresAt,
        applicantName: result.applicantName,
        documents: result.documents,
      })
    }

    validateToken()
    return () => {
      active = false
    }
  }, [token])

  const requestedDocuments = useMemo(
    () => state.documents.filter((document) => requiredStatuses.has(document.status)),
    [state.documents],
  )
  const additionalDocuments = useMemo(
    () => state.documents.filter((document) => document.status === 'not_requested'),
    [state.documents],
  )
  const completedDocuments = useMemo(
    () => state.documents.filter((document) => completedStatuses.has(document.status)),
    [state.documents],
  )

  function handleFileChange(documentId, file) {
    setSelectedFiles((current) => ({ ...current, [documentId]: file }))
    setRowStates((current) => {
      const next = { ...current }
      delete next[documentId]
      return next
    })
    setSubmissionMessage(null)
  }

  async function handleSubmit() {
    const missingRequired = requestedDocuments.filter((document) => !selectedFiles[document.id])

    if (missingRequired.length > 0) {
      setRowStates((current) => ({
        ...current,
        ...Object.fromEntries(
          missingRequired.map((document) => [
            document.id,
            { type: 'error', message: 'Select a file for this requested document.' },
          ]),
        ),
      }))
      setSubmissionMessage({ type: 'error', text: 'Select all requested documents before submitting.' })
      return
    }

    const uploadQueue = state.documents.filter(
      (document) => !completedStatuses.has(document.status) && selectedFiles[document.id],
    )

    if (uploadQueue.length === 0) {
      setSubmissionMessage({ type: 'error', text: 'Choose at least one document to upload.' })
      return
    }

    setSubmitting(true)
    setUploadProgress({ current: 1, completed: 0, total: uploadQueue.length })
    setSubmissionMessage(null)
    const successfulDocuments = []
    let failureCount = 0

    for (const [index, document] of uploadQueue.entries()) {
      setUploadProgress({
        current: index + 1,
        completed: index,
        total: uploadQueue.length,
      })
      setRowStates((current) => ({
        ...current,
        [document.id]: { type: 'progress', message: 'Uploading securely...' },
      }))

      const result = await uploadDriverDocument(token, document.id, selectedFiles[document.id])

      if (!result.ok) {
        failureCount += 1
        setRowStates((current) => ({
          ...current,
          [document.id]: { type: 'error', message: 'Upload failed. Please try again.' },
        }))
        setUploadProgress({
          current: index + 1,
          completed: index + 1,
          total: uploadQueue.length,
        })
        continue
      }

      successfulDocuments.push(result.document)
      setState((current) => ({
        ...current,
        documents: current.documents.map((item) =>
          item.id === result.document.id ? result.document : item,
        ),
      }))
      setSelectedFiles((current) => {
        const next = { ...current }
        delete next[document.id]
        return next
      })
      setRowStates((current) => ({
        ...current,
        [document.id]: { type: 'success', message: 'Uploaded successfully.' },
      }))
      setUploadProgress({
        current: index + 1,
        completed: index + 1,
        total: uploadQueue.length,
      })
    }

    setSubmitting(false)
    if (failureCount === 0) {
      setSubmissionMessage({
        type: 'success',
        text: 'Documents submitted successfully.',
        detail: 'Thank you. Alqudus Express has received your uploaded documents.',
      })
    } else {
      setSubmissionMessage({
        type: 'error',
        text: 'Some documents could not be uploaded. Please retry the failed documents.',
        detail: `${successfulDocuments.length} file${successfulDocuments.length === 1 ? '' : 's'} uploaded successfully.`,
      })
    }
  }

  const availableDocuments = requestedDocuments.length + additionalDocuments.length

  return (
    <main className="min-h-screen bg-off-white px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto w-full max-w-2xl">
        <header className="text-center">
          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full border border-light-steel/70 bg-white shadow-soft sm:h-36 sm:w-36">
            <img
              src="/assets/logos/alqudus-logo-circle.png"
              alt="Alqudus Express Trucking LLC"
              className="h-24 w-24 object-contain sm:h-32 sm:w-32"
            />
          </div>
          <p className="mt-6 text-sm font-black uppercase tracking-wide text-royal sm:mt-7">
            Secure onboarding
          </p>
          <h1 className="mt-2 text-3xl font-black text-navy sm:text-4xl">Secure Document Upload</h1>
          <p className="mx-auto mt-3 max-w-xl leading-7 text-steel">
            Upload the requested onboarding documents for Alqudus Express Trucking.
          </p>
          {state.applicantName ? (
            <p className="mt-3 text-sm font-bold text-navy">Application for {state.applicantName}</p>
          ) : null}
        </header>

        <div className="mt-7 flex gap-3 rounded-lg border border-royal/20 bg-blue-50 p-4 text-sm leading-6 text-navy">
          <LockKeyhole className="mt-0.5 h-5 w-5 flex-none text-royal" aria-hidden="true" />
          <p>
            Your documents are uploaded securely and are only available to authorized Alqudus Express staff.
            Do not include Social Security numbers in file names.
          </p>
        </div>

        {state.loading ? (
          <div className="mt-6 rounded-lg border border-light-steel/70 bg-white p-8 text-center font-bold text-steel">
            Validating secure upload link...
          </div>
        ) : null}

        {state.error ? (
          <section className="mt-6 rounded-lg border border-red-200 bg-white p-6 text-center shadow-sm">
            <ShieldCheck className="mx-auto h-10 w-10 text-red-700" aria-hidden="true" />
            <h2 className="mt-4 text-xl font-black text-navy">Upload link unavailable</h2>
            <p className="mt-2 leading-7 text-steel">{state.error}</p>
            <Link to="/contact" className="mt-5 inline-flex min-h-11 items-center rounded-lg bg-navy px-5 font-bold text-white">
              Contact Alqudus Express
            </Link>
          </section>
        ) : null}

        {!state.loading && !state.error ? (
          <>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-steel">
              <p className="font-bold">
                {requestedDocuments.length} requested document{requestedDocuments.length === 1 ? '' : 's'}
              </p>
              <p>Link expires {formatDate(state.expiresAt)}</p>
            </div>

            {requestedDocuments.length > 0 ? (
              <section className="mt-4">
                <h2 className="text-lg font-black text-navy">Requested documents</h2>
                <div className="mt-3 grid gap-4">
                  {requestedDocuments.map((document) => (
                    <DocumentUploadRow
                      key={document.id}
                      document={document}
                      selectedFile={selectedFiles[document.id]}
                      rowState={rowStates[document.id]}
                      onFileChange={handleFileChange}
                      disabled={submitting}
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {completedDocuments.length > 0 ? (
              <section className="mt-7">
                <h2 className="text-lg font-black text-navy">Completed documents</h2>
                <div className="mt-3 grid gap-4">
                  {completedDocuments.map((document) => (
                    <DocumentUploadRow
                      key={document.id}
                      document={document}
                      rowState={rowStates[document.id]}
                      onFileChange={handleFileChange}
                      disabled
                    />
                  ))}
                </div>
              </section>
            ) : null}

            {additionalDocuments.length > 0 ? (
              <section className="mt-7 rounded-lg border border-light-steel/70 bg-white">
                <button
                  type="button"
                  onClick={() => setShowAdditional((current) => !current)}
                  className="flex min-h-14 w-full items-center justify-between gap-3 px-5 text-left font-black text-navy"
                  aria-expanded={showAdditional}
                >
                  Additional documents
                  <ChevronDown className={`h-5 w-5 transition ${showAdditional ? 'rotate-180' : ''}`} aria-hidden="true" />
                </button>
                {showAdditional ? (
                  <div className="grid gap-4 border-t border-light-steel/70 p-4">
                    {additionalDocuments.map((document) => (
                      <DocumentUploadRow
                        key={document.id}
                        document={document}
                        selectedFile={selectedFiles[document.id]}
                        rowState={rowStates[document.id]}
                        onFileChange={handleFileChange}
                        disabled={submitting}
                      />
                    ))}
                  </div>
                ) : null}
              </section>
            ) : null}

            {availableDocuments === 0 && completedDocuments.length === 0 ? (
              <div className="mt-4 rounded-lg border border-light-steel/70 bg-white p-8 text-center">
                <FileCheck2 className="mx-auto h-10 w-10 text-green-700" aria-hidden="true" />
                <h2 className="mt-3 text-xl font-black text-navy">No documents are currently requested</h2>
                <p className="mt-2 text-steel">Please contact Alqudus Express if you expected an upload request.</p>
              </div>
            ) : null}

            {submissionMessage ? (
              <div
                className={`mt-6 rounded-lg border p-4 text-sm font-bold ${
                  submissionMessage.type === 'success'
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-red-200 bg-red-50 text-red-800'
                }`}
                role="status"
              >
                <p>{submissionMessage.text}</p>
                {submissionMessage.detail ? (
                  <p className="mt-1 font-semibold">{submissionMessage.detail}</p>
                ) : null}
              </div>
            ) : null}

            {availableDocuments > 0 ? (
              <div className="mt-6">
                {submitting && uploadProgress.total > 0 ? (
                  <div className="mb-4 rounded-lg border border-royal/20 bg-white p-4 shadow-sm" role="status">
                    <div className="flex items-center justify-between gap-3 text-sm font-bold text-navy">
                      <span>
                        Uploading {uploadProgress.current} of {uploadProgress.total} documents...
                      </span>
                      <span>{Math.round((uploadProgress.completed / uploadProgress.total) * 100)}%</span>
                    </div>
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-light-steel/60">
                      <div
                        className="h-full rounded-full bg-royal transition-[width] duration-300"
                        style={{
                          width: `${(uploadProgress.completed / uploadProgress.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ) : null}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-lg bg-royal px-6 text-lg font-black text-white transition hover:bg-navy disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <UploadCloud className="h-5 w-5" aria-hidden="true" />
                  {submitting ? 'Uploading documents...' : 'Submit documents'}
                </button>
              </div>
            ) : null}
          </>
        ) : null}
      </div>
    </main>
  )
}
