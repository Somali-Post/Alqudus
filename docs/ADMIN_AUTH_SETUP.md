# Admin Authentication Setup

## Overview

The admin dashboard uses Supabase Auth and the `public.admin_profiles` table.

Application data remains protected by Row Level Security:

- Anonymous visitors may submit applications.
- Anonymous visitors cannot read or update applications.
- Authenticated users can read or update applications only when their user ID exists in `admin_profiles`.

## Setup steps

1. Run the latest `docs/SUPABASE_SCHEMA.sql` in the Supabase SQL editor.
2. In Supabase, open **Authentication > Users**.
3. Create an admin user with email and password.
4. Copy the new user's UUID.
5. Open `docs/ADD_ADMIN_USER.sql` and replace `PASTE_SUPABASE_AUTH_USER_UID_HERE` with the copied UUID.
6. Run `docs/ADD_ADMIN_USER.sql` in the Supabase SQL editor.
7. Open `/admin/login`.
8. Sign in using the email and password created in Supabase Auth.

## Roles

Supported profile roles:

- `owner`
- `admin`
- `viewer`

The current policies treat any listed admin profile as authorized. More granular role permissions can be added later.

## Security requirements

- Never use a Supabase service role key in frontend code.
- Never add a service role key to a `VITE_` environment variable.
- Keep public SELECT and UPDATE access blocked.
- Create admin users through Supabase Authentication, then add their UUID to `admin_profiles`.
- Restart the dev server after changing local environment variables.
