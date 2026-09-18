-- Run in the Supabase Dashboard SQL Editor for the galileeindia project
-- (ujulkvceebtfbezpymzr). Fixes the CRITICAL "rls_disabled_in_public"
-- Security Advisor finding by enabling Row-Level Security on every public
-- table and adding explicit policies for exactly the access each table
-- needs -- nothing is left open by incidental GRANTs alone.

-- contacts: the "Join Us" contact form only ever INSERTs. No one should be
-- able to read, edit, or delete another person's name/email/phone through
-- the public anon key -- staff review submissions from the Supabase
-- dashboard directly, which bypasses RLS.
alter table contacts enable row level security;

drop policy if exists "Public can submit contact forms" on contacts;
create policy "Public can submit contact forms"
  on contacts
  for insert
  to anon, authenticated
  with check (true);

-- prayer_requests: same pattern -- public submit, no public read/edit/delete.
alter table prayer_requests enable row level security;

drop policy if exists "Public can submit prayer requests" on prayer_requests;
create policy "Public can submit prayer requests"
  on prayer_requests
  for insert
  to anon, authenticated
  with check (true);

-- bible_puzzle_scores: the leaderboard needs public INSERT (submit a score)
-- and SELECT (show the board), but not UPDATE/DELETE. This matches the
-- behavior already verified against the live anon key.
alter table bible_puzzle_scores enable row level security;

drop policy if exists "Public can submit puzzle scores" on bible_puzzle_scores;
create policy "Public can submit puzzle scores"
  on bible_puzzle_scores
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Public can view the leaderboard" on bible_puzzle_scores;
create policy "Public can view the leaderboard"
  on bible_puzzle_scores
  for select
  to anon, authenticated
  using (true);
