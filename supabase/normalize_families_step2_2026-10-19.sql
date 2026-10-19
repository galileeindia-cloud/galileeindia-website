-- Run in the Supabase Dashboard SQL Editor for the galileeindia project
-- (ujulkvceebtfbezpymzr). STEP 2 of 2 -- run only AFTER step 1 and after
-- the site has been redeployed with the code that no longer writes
-- `families.head_name`; the old code still sends it and would fail.
--
-- The head of family's name now lives only on their `members` row
-- (relationship = 'head'), e.g.:
--
--   select f.sequence_id, h.salutation, h.full_name as head_name
--   from families f
--   join members h on h.family_sequence_id = f.sequence_id
--                 and h.relationship = 'head';

alter table families
  drop column if exists head_name;
