# Driver Document Workflow

## Current phase

Phase 2 currently provides admin-side onboarding document tracking only.

Authenticated administrators listed in `admin_profiles` can create and manage
document checklist records for a driver application. Anonymous visitors cannot
read or modify document records.

## Current capabilities

- Track driver's license front and back.
- Track CDL, insurance, truck registration, W-9, and medical card readiness.
- Track Social Security verification status without storing the SSN as text.
- Record document status, admin notes, and relevant expiry dates.
- Automatically create the standard checklist when an admin opens an application.

## Privacy rules

- Do not type Social Security numbers into admin notes or public forms.
- Do not store sensitive identity values as plain text.
- Use the W-9 / Tax Form workflow for tax identity collection.
- Driver document records and future files must remain private and admin-only.
- Never expose document storage paths through public policies.

## Not built yet

- Public document upload
- Driver portal
- Secure driver upload links
- Supabase Storage buckets and private file policies
- Document previews or downloads

## Future phase

Add a private Supabase Storage workflow with authenticated admin access and
time-limited secure driver upload links. Storage policies must prevent public
listing or reading of sensitive files.

## Troubleshooting document updates

If a document update fails:

1. Rerun the latest `docs/SUPABASE_SCHEMA.sql` in the Supabase SQL editor.
2. Confirm `admin_profiles` contains the current Supabase Auth user ID.
3. Confirm the `driver_documents` SELECT, INSERT, UPDATE, and DELETE RLS policies exist.
4. Confirm the `authenticated` role has the UPDATE grant on `driver_documents`.
