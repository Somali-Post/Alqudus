# Project Status

## Current phase

Phase 2 onboarding operations foundation.

Current next phase: admin-side driver onboarding document tracking.

## Completed pages

- Home
- Owner Operators
- Apply
- About
- Contact
- Admin applications dashboard UI foundation
- Admin login and protected admin routes
- Admin-side onboarding document checklist

## Known limitations

- Supabase insert works when project credentials and the public insert policy are configured.
- Admin dashboard UI foundation is prepared at `/admin/applications`.
- Supabase Auth login, admin profile authorization, and protected routes are implemented.
- The latest schema must be run and an admin user/profile must be created before real application viewing.
- Contact form still shows prototype success messages only.
- Contact form does not send email yet.
- Document tracking foundation is in progress.
- Sensitive document upload is not built yet.
- Driver portal is not built yet.
- Social Security numbers must not be stored as plain text or entered in notes.
- Carrier-profile details are displayed from the current project data file and should be re-confirmed with the client before production launch.

## Next recommended feature

Secure document upload planning.

Recommended next step: run the latest schema, verify admin document checklist
access, then design private Supabase Storage policies and secure upload links.
