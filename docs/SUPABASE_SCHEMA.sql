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

create table if not exists public.driver_upload_tokens (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.driver_applications(id) on delete cascade,
  token text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  is_revoked boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);

create table if not exists public.application_email_notifications (
  application_id uuid primary key references public.driver_applications(id) on delete cascade,
  admin_sent_at timestamptz,
  applicant_sent_at timestamptz,
  last_attempt_at timestamptz not null default now()
);

alter table public.driver_applications enable row level security;
alter table public.admin_profiles enable row level security;
alter table public.driver_documents enable row level security;
alter table public.driver_upload_tokens enable row level security;
alter table public.application_email_notifications enable row level security;

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

-- Public submission RPC returns only the new UUID. It does not expose
-- application rows and keeps status/source/admin fields server-controlled.
create or replace function public.submit_driver_application(
  p_full_name text,
  p_phone text,
  p_email text,
  p_city text,
  p_state text,
  p_truck_type text,
  p_trailer_type text,
  p_years_experience text,
  p_cdl_status text,
  p_insurance_status text,
  p_preferred_routes text,
  p_availability text,
  p_message text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  new_application_id uuid;
begin
  if nullif(trim(p_full_name), '') is null
    or nullif(trim(p_phone), '') is null
    or nullif(trim(p_city), '') is null
    or nullif(trim(p_state), '') is null
    or nullif(trim(p_truck_type), '') is null
    or nullif(trim(p_cdl_status), '') is null then
    raise exception 'Required application fields are missing';
  end if;

  insert into public.driver_applications (
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
    status,
    source
  )
  values (
    trim(p_full_name),
    trim(p_phone),
    nullif(trim(p_email), ''),
    trim(p_city),
    trim(p_state),
    trim(p_truck_type),
    nullif(trim(p_trailer_type), ''),
    nullif(trim(p_years_experience), ''),
    trim(p_cdl_status),
    nullif(trim(p_insurance_status), ''),
    nullif(trim(p_preferred_routes), ''),
    nullif(trim(p_availability), ''),
    nullif(trim(p_message), ''),
    'new',
    'website'
  )
  returning id into new_application_id;

  return new_application_id;
end;
$$;

revoke all on function public.submit_driver_application(
  text, text, text, text, text, text, text, text, text, text, text, text, text
) from public;

grant execute on function public.submit_driver_application(
  text, text, text, text, text, text, text, text, text, text, text, text, text
) to anon, authenticated;

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

-- Admin-only document update RPC.
-- This provides a POST-based update path for browser environments where the
-- REST PATCH preflight is blocked. It still requires an authenticated user
-- whose auth UID exists in admin_profiles.
create or replace function public.update_driver_document_admin(
  p_document_id uuid,
  p_status text,
  p_notes text,
  p_expires_at date
)
returns public.driver_documents
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  updated_document public.driver_documents;
begin
  if auth.uid() is null or not exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  ) then
    raise exception 'Admin access required' using errcode = '42501';
  end if;

  if p_status is not null and p_status not in (
    'not_requested',
    'requested',
    'received',
    'approved',
    'rejected',
    'expired'
  ) then
    raise exception 'Invalid document status' using errcode = '22023';
  end if;

  update public.driver_documents
  set
    status = coalesce(p_status, status),
    notes = p_notes,
    expires_at = p_expires_at,
    updated_at = now()
  where id = p_document_id
  returning * into updated_document;

  if updated_document.id is null then
    raise exception 'Document not found' using errcode = 'P0002';
  end if;

  return updated_document;
end;
$$;

revoke all on function public.update_driver_document_admin(uuid, text, text, date) from public;
revoke all on function public.update_driver_document_admin(uuid, text, text, date) from anon;
grant execute on function public.update_driver_document_admin(uuid, text, text, date) to authenticated;

-- Upload link records are visible and manageable only to authenticated admins.
-- Anonymous token validation is handled by the driver-document-upload Edge
-- Function so tokens cannot be listed or queried through the REST API.
drop policy if exists "Admins can read driver upload tokens"
on public.driver_upload_tokens;

create policy "Admins can read driver upload tokens"
on public.driver_upload_tokens
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

drop policy if exists "Admins can insert driver upload tokens"
on public.driver_upload_tokens;

create policy "Admins can insert driver upload tokens"
on public.driver_upload_tokens
for insert
to authenticated
with check (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

drop policy if exists "Admins can update driver upload tokens"
on public.driver_upload_tokens;

create policy "Admins can update driver upload tokens"
on public.driver_upload_tokens
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

drop policy if exists "Admins can delete driver upload tokens"
on public.driver_upload_tokens;

create policy "Admins can delete driver upload tokens"
on public.driver_upload_tokens
for delete
to authenticated
using (
  exists (
    select 1
    from public.admin_profiles
    where admin_profiles.user_id = auth.uid()
  )
);

revoke all on public.driver_upload_tokens from anon;
grant select, insert, update, delete on public.driver_upload_tokens to authenticated;

-- Private storage bucket used only by the token-validating Edge Function.
-- Do not add public storage.objects policies for this bucket.
insert into storage.buckets (id, name, public)
values ('driver-documents', 'driver-documents', false)
on conflict (id) do update
set public = false;

-- Email delivery bookkeeping is internal to the server-side application
-- submission email function. No browser role receives table access.
revoke all on public.application_email_notifications from anon, authenticated;
