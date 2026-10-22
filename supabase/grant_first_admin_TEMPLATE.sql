-- TEMPLATE -- copy into the Supabase SQL Editor, fill in the two values,
-- and run. Do NOT save your real password in this file.
--
-- Makes one existing member a full admin (access_level 1) with a password.
-- Use at least 10 characters including a letter and a number (the rule the
-- admin site enforces), and change it from /admin/members afterwards, since
-- the SQL Editor may keep this query -- password included -- in its history.
-- After this, that admin can grant access to others from /admin/members.
-- Run admin_access_2026-10-20.sql first.

update members
set access_level = 1,
    password_hash = extensions.crypt('YOUR-PASSWORD-HERE', extensions.gen_salt('bf', 10))
where phone = 'YOUR-PHONE-NUMBER'
  and relationship = 'head';

-- Check it worked (should list one row with access_level 1):
select full_name, phone, access_level, password_hash is not null as has_password
from members
where access_level > 0;
