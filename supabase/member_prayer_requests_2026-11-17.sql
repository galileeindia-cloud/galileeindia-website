-- Run in the Supabase Dashboard SQL Editor for the galileeindia project
-- (ujulkvceebtfbezpymzr). Creates the table behind the admin "Prayer
-- Requests" page: prayer requests recorded by admins on behalf of members.
--
-- Separate from `prayer_requests`, which holds requests sent through the
-- public Join Us form and is linked to website contacts, not members.

create table if not exists member_prayer_requests (
  request_uuid uuid primary key default gen_random_uuid(),
  sequence_id integer generated always as identity unique,
  -- The date the request applies to; defaults to today on the form but
  -- can be changed (e.g. when entering a request received earlier).
  request_date date not null,
  member_uuid uuid not null references members (member_uuid),
  prayer_request text not null check (length(trim(prayer_request)) > 0),
  is_closed boolean not null default false,
  closed_at timestamptz,
  -- The admin who entered it, and when the record itself was created.
  created_by uuid references members (member_uuid),
  created_at timestamptz not null default now(),

  -- One request per person per date: a member can have many requests,
  -- but on different dates.
  constraint member_prayer_requests_member_date_key unique (member_uuid, request_date)
);

create index if not exists member_prayer_requests_member_idx on member_prayer_requests (member_uuid);
create index if not exists member_prayer_requests_open_idx on member_prayer_requests (is_closed, request_date desc);

-- RLS on with no policies: the public (anon) key can neither read nor
-- write this table. Only the admin pages, which use the service role key,
-- can reach it.
alter table member_prayer_requests enable row level security;
