-- Alqudus Express Trucking LLC
-- Phase 1 driver application schema for Supabase.

create table if not exists public.driver_applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  phone text not null,
  email text,
  city text not null,
  state text not null,
  truck_type text not null,
  trailer_type text,
  years_experience text,
  cdl_status text not null,
  insurance_status text,
  preferred_routes text,
  availability text,
  message text,
  status text not null default 'new',
  admin_notes text,
  source text not null default 'website',
  constraint driver_applications_status_check
    check (status in ('new', 'contacted', 'documents_requested', 'approved', 'rejected', 'inactive'))
);

alter table public.driver_applications enable row level security;

-- RLS guidance:
-- Public website visitors should be allowed to insert application submissions.
-- Public visitors should NOT be allowed to select application rows.
-- Admin select/update policies should be added later for authenticated admin users only.

-- Public insert policy for website submissions.
-- Review this policy in Supabase before production launch.
drop policy if exists "Allow public driver application inserts"
on public.driver_applications;

create policy "Allow public driver application inserts"
on public.driver_applications
for insert
to anon
with check (
  source = 'website'
  and status = 'new'
  and full_name is not null
  and phone is not null
  and city is not null
  and state is not null
  and truck_type is not null
  and cdl_status is not null
);

-- Allow anonymous visitors to write submission fields only.
-- Do not grant insert access to status, admin_notes, id, or created_at.
revoke insert on public.driver_applications from anon;

grant insert (
  full_name,
  phone,
  email,
  city,
  state,
  truck_type,
  trailer_type,
  years_experience,
  cdl_status,
  insurance_status,
  preferred_routes,
  availability,
  message,
  source
)
on public.driver_applications
to anon;

-- Do not create a public select policy.
-- Example admin policies to add later after Supabase Auth/admin roles are defined:
--
-- create policy "Allow authenticated admins to read applications"
-- on public.driver_applications
-- for select
-- to authenticated
-- using (
--   exists (
--     select 1
--     from public.admin_profiles
--     where admin_profiles.user_id = auth.uid()
--   )
-- );
--
-- create policy "Allow authenticated admins to update applications"
-- on public.driver_applications
-- for update
-- to authenticated
-- using (
--   exists (
--     select 1
--     from public.admin_profiles
--     where admin_profiles.user_id = auth.uid()
--   )
-- )
-- with check (
--   exists (
--     select 1
--     from public.admin_profiles
--     where admin_profiles.user_id = auth.uid()
--   )
-- );
