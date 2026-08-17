import { supabase } from "@/lib/supabase";

export interface LeaderboardEntry {
  score_uuid: string;
  puzzle_id: string;
  player_name: string;
  time_taken_ms: number;
  created_at: string;
}

export async function submitScore(
  puzzleId: string,
  playerName: string,
  timeTakenMs: number
) {
  const score_uuid = crypto.randomUUID();

  const { error } = await supabase.from("bible_puzzle_scores").insert([
    {
      score_uuid,
      puzzle_id: puzzleId,
      player_name: playerName,
      time_taken_ms: timeTakenMs,
    },
  ]);

  if (error) {
    throw error;
  }

  return { score_uuid };
}

export async function fetchLeaderboard(
  puzzleId: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  const { data, error } = await supabase
    .from("bible_puzzle_scores")
    .select("score_uuid, puzzle_id, player_name, time_taken_ms, created_at")
    .eq("puzzle_id", puzzleId)
    .order("time_taken_ms", { ascending: true })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}
