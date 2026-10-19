-- Run in the Supabase Dashboard SQL Editor for the galileeindia project
-- (ujulkvceebtfbezpymzr). Adds a salutation (Mr. / Mrs. / Miss) to each
-- member, chosen per person on the registration form. Nullable so rows
-- registered before this column existed stay valid.

alter table members
  add column if not exists salutation text;

alter table members
  drop constraint if exists members_salutation_check;

alter table members
  add constraint members_salutation_check
  check (salutation is null or salutation in ('Mr.', 'Mrs.', 'Miss'));
