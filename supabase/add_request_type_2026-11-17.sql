-- Run in the Supabase Dashboard SQL Editor for the galileeindia project
-- (ujulkvceebtfbezpymzr), after member_prayer_requests_2026-11-17.sql.
-- Adds "Type of Request" to admin prayer requests. The allowed values must
-- match PRAYER_REQUEST_TYPES in src/lib/prayerRequestTypes.ts.

alter table member_prayer_requests
  add column if not exists request_type text;

alter table member_prayer_requests
  drop constraint if exists member_prayer_requests_type_check;

alter table member_prayer_requests
  add constraint member_prayer_requests_type_check
  check (request_type is null or request_type in (
    'Job and Promotion',
    'Health and Healing',
    'Spiritual Growth',
    'Exam and Studies',
    'Family Issues',
    'Bereavement and Comfort',
    'Marriages and Life Partners',
    'Financial Needs',
    'Pregnant Mothers',
    'Seeking Children',
    'Travel'
  ));
