-- Run in the Supabase Dashboard SQL Editor for the galileeindia project.
-- Removes the test row created while verifying the new `score` column on
-- bible_puzzle_scores end-to-end via curl. The anon key used by the app
-- (and by this verification) cannot DELETE directly because RLS does not
-- grant delete to the anon role -- consistent with the prior cleanup script
-- (cleanup_test_puzzle_scores_2026-08-22.sql), so this has to be run
-- manually with elevated (dashboard/service-role) access.

delete from bible_puzzle_scores
where score_uuid in (
  'fdb708f2-18a3-4bad-9b99-84e742cf8893' -- AgentVerifyTest, puzzle_id 14, score 10
);
