-- Replace PASTE_SUPABASE_AUTH_USER_UID_HERE with the UID shown in
-- Supabase Authentication > Users.
--
-- This script does not create a login user. The user must already exist
-- in Supabase Auth with an email and password.
--
-- This script only grants dashboard access by adding the existing Auth
-- user to public.admin_profiles.
--
-- Never use a Supabase service role key in frontend code.

insert into public.admin_profiles (user_id, email, full_name, role)
values (
  '14e60638-897a-4ddc-ba56-78117125413f',
  'alqudusexpresstrucking@gmail.com',
  'Alqudus Admin',
  'owner'
)
on conflict (user_id) do update
set
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role;
