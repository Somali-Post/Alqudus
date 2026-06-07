# Driver Document Workflow

## Current phase

Phase 3 adds secure, tokenized driver document upload links without introducing
a full driver portal.

Authenticated administrators listed in `admin_profiles` can create and manage
document checklist records for a driver application. Anonymous visitors cannot
read or modify document records.

## Current capabilities

- Track driver's license front and back.
- Track CDL, insurance, truck registration, W-9, and medical card readiness.
- Track Social Security verification status without storing the SSN as text.
- Record document status, admin notes, and relevant expiry dates.
- Automatically create the standard checklist when an admin opens the full application detail page.
- Review applications and manage onboarding at `/admin/applications/:id`.
- Mark common documents or the full checklist as requested in one saved bulk action.
- Generate and revoke upload links from the application detail side panel.
- Copy ready-made WhatsApp, SMS, or email request messages containing the secure link.
- Send the document request email through an authenticated Supabase Edge Function.
- Notify Alqudus when a new owner-operator application is submitted.
- Send applicants a receipt confirmation when they provide an email address.
- Upload requested PDF, JPG, and PNG files through a token-validating Edge Function.
- Select multiple requested documents on one page and submit them in one session.
- Store files in the private `driver-documents` Supabase Storage bucket.
- Mark document records as `received` after a successful upload.
- Let authenticated admins view or download uploaded files through short-lived
  signed Storage URLs.

## Privacy rules

- Do not type Social Security numbers into admin notes or public forms.
- Do not store sensitive identity values as plain text.
- Use the W-9 / Tax Form workflow for tax identity collection.
- Driver document records and future files must remain private and admin-only.
- Never expose document storage paths through public policies.
- Upload links expire 14 days after creation and can be revoked by an admin.
- Anonymous visitors cannot list upload tokens, document rows, or Storage objects.

## Secure upload architecture

The `/upload-documents/:token` page calls the `driver-document-upload` Supabase
Edge Function. The function validates the token server-side before reading
requested document rows or writing to the private bucket.

The browser submits each selected document through a separate secure function
request. This keeps document records independent: successful files remain
received if another file fails, and failed rows can be retried without selecting
the successful files again. Admins continue to track every document separately.

The admin opens an application from `/admin/applications`, reviews the driver
details on the full detail page, selects and saves requested documents, and then
generates the secure upload link. Message and email actions stay disabled until
at least one requested, rejected, or expired document exists in the saved
database state.

Each document card saves through the authenticated
`update_driver_document_admin` database function. The function verifies that the
current Auth user exists in `admin_profiles` before updating the document row.
This POST-based RPC avoids browser PATCH/preflight failures without granting
anonymous access or bypassing the admin authorization check.

The **Mark common documents as requested** and **Request all documents** actions
save immediately and then reload the checklist from Supabase. Requested
documents must be saved before the upload link is sent. The secure upload page
reads these saved statuses from Supabase and displays only `requested`,
`rejected`, or `expired` rows as required uploads.

After generating a link, the admin manually sends it to the driver by WhatsApp,
SMS, or email using the message helpers in the detail page side panel.

The admin can also click **Send email request**. The React app calls the
authenticated `send-document-request-email` Edge Function, which verifies the
admin user, loads the applicant email, validates the active upload token, and
sends through Resend. Resend API keys and sender settings are stored only as
Supabase function secrets; no email provider keys are stored in frontend code.
A future phase can add automatic email or SMS notifications.

The public Apply form also invokes `send-application-submission-email` after the
database insert succeeds. The function accepts only the generated application
ID, loads the application server-side, and sends:

- A new-application notification to `alqudusexpresstrucking@gmail.com`.
- An application receipt confirmation to the applicant when an email is present.

Email failure does not roll back or hide a successful application submission.
Delivery bookkeeping prevents normal retries from sending duplicate messages.

The driver opens the tokenized link and sees only documents whose saved status
is `requested`, `rejected`, or `expired`. After upload, each document remains a
separate checklist record so the admin can track received files independently.

The Edge Function uses Supabase's server-side `SUPABASE_SERVICE_ROLE_KEY`
environment variable. That key must never be added to `.env.local`, exposed as
a `VITE_` variable, or used directly by the React application.

## Secure admin downloads

Uploaded documents remain in the private `driver-documents` bucket. When an
authorized admin clicks **View / Download**, the frontend calls the authenticated
`get-driver-document-download-url` Edge Function with only the document record
ID. The function verifies the caller's Supabase Auth JWT, confirms the user
exists in `admin_profiles`, and generates a signed Storage URL valid for five
minutes.

The storage path is not returned separately, files are not made public, and
anonymous users cannot request signed download URLs.

## Deployment

1. Rerun `docs/SUPABASE_SCHEMA.sql` to create `driver_upload_tokens`, its RLS
   policies, and the private `driver-documents` bucket.
2. Install and authenticate the Supabase CLI.
3. Link the local repository to the Supabase project.
4. Deploy the upload function:

```bash
supabase functions deploy driver-document-upload
```

5. Confirm the Supabase CLI:

```bash
npx supabase --version
```

6. Configure the Resend secrets:

```bash
npx supabase secrets set RESEND_API_KEY=your_resend_api_key
npx supabase secrets set DOCUMENT_REQUEST_FROM_EMAIL=onboarding@resend.dev
```

7. Deploy the authenticated email function:

```bash
npx supabase functions deploy send-document-request-email
```

8. Deploy the application submission email function:

```bash
npx supabase functions deploy send-application-submission-email
```

9. Deploy the secure admin document download function:

```bash
npx supabase functions deploy get-driver-document-download-url
```

`onboarding@resend.dev` is suitable for initial Resend testing. Production
delivery to arbitrary applicants requires a verified sender/domain, such as
`onboarding@alqudusexpresstrucking.com`.

The repository's `supabase/config.toml` disables JWT verification for this
single function because drivers are not authenticated. The function performs
its own token validation before allowing any operation.

## Not built yet

- Driver portal
- Document previews
- Upload audit log
- Automatic email and SMS notifications

## Future phase

Add document previews and an audit log for token generation, uploads, downloads,
and revocations.

## Troubleshooting document updates

If a document update fails:

1. Rerun the latest `docs/SUPABASE_SCHEMA.sql` in the Supabase SQL editor.
2. Confirm `admin_profiles` contains the current Supabase Auth user ID.
3. Confirm the `driver_documents` SELECT, INSERT, UPDATE, and DELETE RLS policies exist.
4. Confirm the `authenticated` role has the UPDATE grant on `driver_documents`.
5. Confirm the `update_driver_document_admin` function exists and the
   `authenticated` role has EXECUTE permission.
