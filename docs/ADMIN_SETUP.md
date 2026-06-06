# Admin Dashboard Setup

## Current foundation

The admin dashboard UI is available at:

- `/admin`
- `/admin/applications`

`/admin` redirects to the applications management page.

## Security model

Driver applications are protected by Supabase Row Level Security.

- Public website users may insert application submissions.
- Public SELECT access is intentionally blocked.
- Public UPDATE access is intentionally blocked.
- The admin frontend does not bypass RLS.
- Service role keys must never be placed in frontend code or Vite environment variables.

## Authentication

Supabase Auth and the `admin_profiles` authorization model are implemented in the app and schema.

The RLS policies allow only authenticated users listed in `admin_profiles` to:

- Select driver applications.
- Update application status.
- Update admin notes.

Follow `docs/ADMIN_AUTH_SETUP.md` to create the first admin user and profile.

## Current behavior

Without an authenticated and authorized Supabase admin session, protected routes redirect to `/admin/login`.

The admin service returns controlled errors for blocked reads and updates. It does not use service role credentials or disable RLS.
