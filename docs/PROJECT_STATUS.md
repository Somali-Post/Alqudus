# Project Status

## Current phase

Phase 3 secure driver document upload foundation.

Current next phase: deploy and verify tokenized private document uploads.

## Completed pages

- Home
- Owner Operators
- Apply
- About
- Contact
- Admin applications dashboard UI foundation
- Full admin application detail page at `/admin/applications/:id`
- Admin login and protected admin routes
- Admin-side onboarding document checklist
- Saved bulk document request actions and per-document management
- Admin upload-link generation and revocation controls
- Admin document-request email action
- Public tokenized document upload page
- Private Storage upload Edge Function foundation
- Authenticated Resend email Edge Function foundation
- Automatic admin notification for new driver applications
- Applicant application confirmation email when an email is provided
- Secure admin document view/download using short-lived signed URLs

## Known limitations

- Supabase insert works when project credentials and the public insert policy are configured.
- Admin dashboard UI foundation is prepared at `/admin/applications`.
- Application review, status management, document requests, and secure upload
  link actions are available on the protected full application detail page.
- Supabase Auth login, admin profile authorization, and protected routes are implemented.
- The latest schema must be run and an admin user/profile must be created before real application viewing.
- Contact form still shows prototype success messages only.
- Contact form does not send email yet.
- Document tracking foundation is implemented.
- Secure upload code is prepared but requires the latest schema and deployed Edge Function.
- Document request email sending requires deployed `send-document-request-email`
  and configured Resend function secrets.
- Application submission emails require the latest schema RPC, configured Resend
  secrets, and deployed `send-application-submission-email`.
- Driver portal is not built yet.
- Social Security numbers must not be stored as plain text or entered in notes.
- Secure admin downloads require deployment of
  `get-driver-document-download-url`.
- Upload audit logging is not built yet.
- Carrier-profile details are displayed from the current project data file and should be re-confirmed with the client before production launch.

## Next recommended feature

Secure document upload deployment and verification.

Recommended next step: run the latest schema, deploy `driver-document-upload`,
generate an upload link, and verify that a requested document is stored in the
private bucket and marked `received`.
