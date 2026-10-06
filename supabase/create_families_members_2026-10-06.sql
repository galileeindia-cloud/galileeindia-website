-- Run in the Supabase Dashboard SQL Editor for the galileeindia project
-- (ujulkvceebtfbezpymzr). Creates the `families` and `members` tables for
-- the member-registration form, reviewed and agreed in chat before this
-- was written. Captures enough to send birthday, anniversary, and other
-- occasion greetings to every member of every family individually.

create table if not exists families (
  family_uuid uuid primary key,
  sequence_id integer generated always as identity unique,
  head_name text not null,
  -- The couple's wedding anniversary. Lives here rather than on each
  -- spouse's member row so it can't drift into two different dates.
  anniversary_date date,
  -- Only the year and month are meaningful; the form always submits the
  -- 1st of the month and the day is never shown or used.
  attending_since date,
  -- Set when this family's head grew up in another family already in this
  -- table and has since married and started their own household. The
  -- head's original row stays in the origin family too, as history.
  origin_family_uuid uuid references families (family_uuid),
  created_at timestamptz not null default now()
);

create table if not exists members (
  member_uuid uuid primary key,
  sequence_id integer generated always as identity unique,
  family_uuid uuid not null references families (family_uuid),
  full_name text not null,
  relationship text not null check (
    relationship in ('head', 'spouse', 'child', 'parent', 'in_law')
  ),
  -- Split out instead of a single `date` column so the birth year can be
  -- left blank (common for anyone who'd rather not share their age) while
  -- still capturing enough -- month + day -- to send a birthday greeting.
  birth_day smallint,
  birth_month smallint,
  birth_year smallint,
  phone text,
  email text,
  -- Agreed to be contacted with greetings/updates. Captured once on the
  -- registration form and applied to everyone listed in that submission,
  -- but stored per person so an individual's answer can be updated later
  -- without touching the rest of the family.
  consent boolean not null default false,
  is_baptized boolean not null default false,
  created_at timestamptz not null default now(),

  constraint members_birth_day_range check (birth_day is null or birth_day between 1 and 31),
  constraint members_birth_month_range check (birth_month is null or birth_month between 1 and 12),
  constraint members_birth_year_range check (birth_year is null or birth_year between 1900 and 2100),
  -- Day and month are always given together -- there's no such thing as
  -- knowing one without the other -- while the year stays independently
  -- optional.
  constraint members_birth_day_month_together check ((birth_day is null) = (birth_month is null))
);

create index if not exists members_family_uuid_idx on members (family_uuid);
create index if not exists families_origin_family_uuid_idx on families (origin_family_uuid);

-- RLS: the public registration form only ever INSERTs. Nobody should be
-- able to read another family's birthdays, phone numbers, or anniversary
-- back out through the public anon key -- same insert-only pattern as
-- `contacts` and `prayer_requests`. Staff pull the list for sending
-- greetings from the Supabase dashboard directly, which bypasses RLS.
alter table families enable row level security;

drop policy if exists "Public can register a family" on families;
create policy "Public can register a family"
  on families
  for insert
  to anon, authenticated
  with check (true);

alter table members enable row level security;

drop policy if exists "Public can register family members" on members;
create policy "Public can register family members"
  on members
  for insert
  to anon, authenticated
  with check (true);
