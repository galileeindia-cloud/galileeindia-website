-- Run in the Supabase Dashboard SQL Editor for the galileeindia project.
-- Adds a `score` column to bible_puzzle_scores so puzzles that grade
-- correctness (the trivia quiz) can rank by score, not just completion
-- time. Nullable because the order/match/word-find puzzles have no notion
-- of a score and will keep submitting NULL here.

alter table bible_puzzle_scores
  add column if not exists score integer;
