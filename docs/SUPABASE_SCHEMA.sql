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

create table if not exists public.admin_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role text not null default 'admin',
  created_at timestamptz not null default now(),
  constraint admin_profiles_role_check
    check (role in ('admin', 'owner', 'viewer'))
);

create table if not exists public.driver_documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.driver_applications(id) on delete cascade,
  document_type text not null,
  status text not null default 'not_requested',
  file_path text,
  file_name text,
  expires_at date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint driver_documents_type_check
    check (
      document_type in (
        'drivers_license_front',
        'drivers_license_back',
        'cdl',
        'insurance',
        'truck_registration',
        'w9_tax_form',
        'medical_card',
        'ssn_verification',
        'other'
      )
    ),
  constraint driver_documents_status_check
    check (
      status in (
        'not_requested',
        'requested',
        'received',
        'approved',
        'rejected',
        'expired'
      )
    ),
  constraint driver_documents_application_type_key
    unique (application_id, document_type)
);

alter table public.driver_applications enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.driver_documents enable row level security;

-- Admin profile access:
-- Authenticated users may read only their own admin profile.
drop policy if exists "Allow users to read their own admin profile"
on public.admin_profiles;

create policy "Allow users to read their own admin profile"
on public.admin_profiles
for select
to authenticated
using (user_id = auth.uid());

revoke all on public.admin_profiles from anon;
revoke insert, update, delete on public.admin_profiles from authenticated;
grant select on public.admin_profiles to authenticated;

-- Access model:
-- Public website visitors may insert application submissions.
-- Public visitors may not select application rows.
-- Authenticated users listed in admin_profiles may select and update applications.

-- Public form insert policy for website submissions.
-- Authenticated insert is also allowed because an admin may be logged in
-- while testing or using the public Apply form. This does not allow
-- authenticated users to read applications unless they are in admin_profiles.
-- Review this policy in Supabase before production launch.
drop policy if exists "Allow public driver application inserts"
on public.driver_applications;

create policy "Allow public driver application inserts"
on public.driver_applications
for insert
to anon, authenticated
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

-- Allow anonymous and authenticated users to write submission fields only.
-- Do not grant insert access to status, admin_notes, id, or created_at.
revoke insert on public.driver_applications from anon, authenticated;

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
to anon, authenticated;

-- Authenticated admin application access.
-- Public anon SELECT remains blocked because no anon SELECT policy or grant exists.
drop policy if exists "Allow authenticated admins to read applications"
on public.driver_applications;

create policy "Allow authenticated admins to read applications"
on public.driver_applications
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

drop policy if exists "Allow authenticated admins to update applications"
on public.driver_applications;

create policy "Allow authenticated admins to update applications"
on public.driver_applications
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

revoke select, update, delete on public.driver_applications from anon;
revoke delete on public.driver_applications from authenticated;
grant select on public.driver_applications to authenticated;
grant update (status, admin_notes) on public.driver_applications to authenticated;

-- Driver onboarding document tracking is admin-only.
-- No file upload or SSN text storage is implemented in this phase.
drop policy if exists "Allow authenticated admins to read driver documents"
on public.driver_documents;

create policy "Allow authenticated admins to read driver documents"
on public.driver_documents
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

drop policy if exists "Allow authenticated admins to insert driver documents"
on public.driver_documents;

create policy "Allow authenticated admins to insert driver documents"
on public.driver_documents
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

drop policy if exists "Allow authenticated admins to update driver documents"
on public.driver_documents;

drop policy if exists "Admins can update driver documents"
on public.driver_documents;

create policy "Admins can update driver documents"
on public.driver_documents
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

drop policy if exists "Allow authenticated admins to delete driver documents"
on public.driver_documents;

create policy "Allow authenticated admins to delete driver documents"
on public.driver_documents
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

revoke all on public.driver_documents from anon;
grant select, insert, update, delete on public.driver_documents to authenticated;
