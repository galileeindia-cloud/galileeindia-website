-- Run in the Supabase Dashboard SQL Editor for the galileeindia project
-- (ujulkvceebtfbezpymzr). Adds admin access for the /admin area.
--
--   access_level 0 = ordinary member (default)
--                1 = admin: reports + add/edit members
--                2 = reports only (view, download slide, email)
--
-- Admins log in with their phone number and a password; only a bcrypt
-- hash of the password is stored.

alter table members
  add column if not exists access_level smallint not null default 0;

alter table members
  drop constraint if exists members_access_level_check;
alter table members
  add constraint members_access_level_check check (access_level in (0, 1, 2));

alter table members
  add column if not exists password_hash text;

-- IMPORTANT: the public registration form inserts with the anon key, and
-- the old policy accepted any column values. Without this, anyone could
-- register themselves with access_level = 1 and a password of their
-- choosing. Public inserts may now only create ordinary members.
drop policy if exists "Public can register family members" on members;
create policy "Public can register family members"
  on members
  for insert
  to anon, authenticated
  with check (access_level = 0 and password_hash is null);
