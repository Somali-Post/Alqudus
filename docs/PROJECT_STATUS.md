# Project Status

## Current phase

Phase 1 public website prototype.

Current next phase: Supabase application submission integration.

## Completed pages

- Home
- Owner Operators
- Apply
- About
- Contact

## Known limitations

- Backend is prepared but requires Supabase credentials.
- Apply form submission is wired to Supabase through the application service, but it cannot submit until `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are configured.
- Contact form still shows prototype success messages only.
- Contact form does not send email yet.
- Admin dashboard is not built yet.
- Document upload is not built yet.
- Carrier-profile details are displayed from the current project data file and should be re-confirmed with the client before production launch.

## Next recommended feature

Application form data handling.

Recommended next step: configure Supabase credentials, run the schema, and verify driver application records are inserted into `driver_applications`.
