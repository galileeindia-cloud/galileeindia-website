-- Run in the Supabase Dashboard SQL Editor for the galileeindia project
-- (ujulkvceebtfbezpymzr). Adds a mailing address to `families`. One per
-- household rather than per member -- unlike phone/email, which differ
-- person to person, a family normally shares a single physical address.
-- All three are optional; nothing existing is affected.

alter table families
  add column if not exists address text,
  add column if not exists city text,
  add column if not exists zip_code text;
