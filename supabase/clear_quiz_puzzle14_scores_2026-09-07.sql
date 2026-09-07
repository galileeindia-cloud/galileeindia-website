-- Run in the Supabase Dashboard SQL Editor for the galileeindia project.
-- Clears all leaderboard entries for Puzzle 14 (Bible Trivia Quiz),
-- including plays made while testing/editing the question set, so the
-- leaderboard starts clean.

delete from bible_puzzle_scores
where puzzle_id = '14';
