# Backend Setup

## Supabase setup

1. Create a Supabase project.
2. Open the Supabase SQL editor.
3. Run `docs/SUPABASE_SCHEMA.sql`.
4. Copy the Supabase project URL and anon key.
5. Create `.env.local` from `.env.example`.
6. Add the local credentials:

```bash
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

7. Restart the dev server:

```bash
npm run dev
```

8. Test the Apply form submission.
9. Confirm a new record appears in the `driver_applications` table.

The current Apply form uses the `submit_driver_application` database function
to return only the new application UUID without granting public SELECT access.
Rerun the latest schema before testing application submission emails.

## Application email deployment

Configure the server-side Resend secrets:

```bash
npx supabase secrets set RESEND_API_KEY=your_resend_api_key
npx supabase secrets set DOCUMENT_REQUEST_FROM_EMAIL=onboarding@resend.dev
```

Deploy the application notification function:

```bash
npx supabase functions deploy send-application-submission-email
```

The Resend API key must never be added to Vite `.env.local` variables.

## Troubleshooting row-level security

If the browser reports PostgreSQL error `42501` or says a new row violates row-level security:

1. Run `docs/SUPABASE_SCHEMA.sql` again in the Supabase SQL editor.
2. Confirm the policy named `Allow public driver application inserts` exists on `driver_applications`.
3. Confirm there is no public select policy. The website insert intentionally does not request the inserted row back.
4. Retry the Apply form.

If submissions work while signed out but fail while logged in as an admin,
rerun the latest `docs/SUPABASE_SCHEMA.sql`. The insert policy and restricted
column grant must include both `anon` and `authenticated` so the public Apply
form works during an active admin session.

## Current backend scope

- Supabase is prepared for driver application submissions.
- Public inserts are allowed by the schema guidance.
- Public reads are not allowed.
- Admin dashboard, admin authentication, document upload, and application review workflows are not built yet.
