-- Run in the Supabase Dashboard SQL Editor for the galileeindia project.
-- Read-only: for each puzzle, shows the top-ranked player. Puzzle 14 (the
-- trivia quiz, the only puzzle that grades correctness) ranks by score
-- first, then time as a tiebreak — same as its in-app leaderboard. Every
-- other puzzle has no score (always NULL) and ranks by fastest time only.

with puzzle_titles (puzzle_id, title) as (
  values
    ('1', 'Books of the New Testament'),
    ('2', 'Books of the Old Testament'),
    ('3', 'Authors of the New Testament'),
    ('4', 'Names of Jesus'),
    ('5', 'Disciples of Jesus'),
    ('6', 'Equipped for Service'),
    ('7', 'The Fruit of the Spirit'),
    ('8', 'Devoted to These Four Things'),
    ('9', 'Persons in the Life of Abraham'),
    ('10', 'Jesus''s Closest Disciples'),
    ('11', 'The Seven Churches Referred to as Seven Lampstands in the Book of Revelation'),
    ('12', 'Words from Popular Bible Verses'),
    ('13', 'Unjumble the Woman''s Names Found in the Bible'),
    ('14', 'Bible Trivia Quiz'),
    ('15', 'Unjumble the First 5 Books of the Bible'),
    ('16', 'Unjumble the Major Prophets')
),
best_times as (
  select distinct on (puzzle_id)
    puzzle_id,
    player_name,
    time_taken_ms,
    score,
    created_at
  from bible_puzzle_scores
  order by
    puzzle_id,
    case when puzzle_id = '14' then -coalesce(score, 0) end nulls last,
    time_taken_ms asc
)
select
  coalesce(pt.title, bt.puzzle_id) as puzzle,
  bt.puzzle_id,
  bt.player_name as best_player,
  bt.time_taken_ms,
  round(bt.time_taken_ms / 1000.0, 1) as time_taken_seconds,
  bt.score,
  bt.created_at
from best_times bt
left join puzzle_titles pt on pt.puzzle_id = bt.puzzle_id
-- Puzzle IDs are normally "1".."16", but the table may also hold stray
-- rows from old/test data with a non-numeric puzzle_id (e.g. a leftover
-- "bible-trivia" slug) — sort those after the real, numbered puzzles
-- instead of failing on the cast.
order by
  case when bt.puzzle_id ~ '^[0-9]+$' then bt.puzzle_id::int end nulls last,
  bt.puzzle_id;
