-- Run in the Supabase Dashboard SQL Editor for the galileeindia project.
-- Removes the test row created while probing RLS UPDATE permissions on
-- bible_puzzle_scores (confirmed the anon key cannot UPDATE or DELETE
-- rows -- only INSERT and SELECT, as intended for a public leaderboard).
-- The anon key can't delete it itself, same RLS restriction as prior
-- cleanup scripts.

delete from bible_puzzle_scores
where score_uuid in (
  'c214ab98-a589-4e98-a636-fbb35428c534' -- RLSProbeTest, puzzle_id "rls-test"
);
