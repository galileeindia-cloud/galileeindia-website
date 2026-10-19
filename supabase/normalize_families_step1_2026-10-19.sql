-- Run in the Supabase Dashboard SQL Editor for the galileeindia project
-- (ujulkvceebtfbezpymzr). STEP 1 of 2 -- safe to run while the current
-- site is live; run step 2 only after the new code is deployed.
--
-- 1. `families.head_name` duplicated the head member's `full_name` and is
--    being removed (step 2). Here it just stops being required, so the
--    new form -- which no longer sends it -- can register families.
-- 2. `members.family_sequence_id` copies the family's `sequence_id` onto
--    each member for easy joins (e.g. `join families f using (family_sequence_id)`
--    or simply grouping members by family number). The public form can't
--    read `families` back (RLS is insert-only), so a trigger fills it in
--    from `family_uuid`, and a composite foreign key guarantees the two
--    columns can never point at different families.

alter table families
  alter column head_name drop not null;

-- Composite FK target: (family_uuid, sequence_id) is trivially unique
-- since family_uuid alone is the primary key.
alter table families
  drop constraint if exists families_uuid_sequence_key;
alter table families
  add constraint families_uuid_sequence_key unique (family_uuid, sequence_id);

alter table members
  add column if not exists family_sequence_id integer;

-- SECURITY DEFINER so the lookup works for anon inserts, which RLS
-- otherwise blocks from reading `families`.
create or replace function set_member_family_sequence_id()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  select sequence_id into new.family_sequence_id
  from families
  where family_uuid = new.family_uuid;
  return new;
end;
$$;

drop trigger if exists members_set_family_sequence_id on members;
create trigger members_set_family_sequence_id
  before insert or update of family_uuid on members
  for each row execute function set_member_family_sequence_id();

-- Backfill members registered before this column existed.
update members m
set family_sequence_id = f.sequence_id
from families f
where f.family_uuid = m.family_uuid
  and m.family_sequence_id is distinct from f.sequence_id;

alter table members
  alter column family_sequence_id set not null;

alter table members
  drop constraint if exists members_family_sequence_fk;
alter table members
  add constraint members_family_sequence_fk
  foreign key (family_uuid, family_sequence_id)
  references families (family_uuid, sequence_id);

create index if not exists members_family_sequence_id_idx on members (family_sequence_id);
