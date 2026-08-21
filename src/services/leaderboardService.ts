import { supabase } from "@/lib/supabase";
import { withRetry } from "@/lib/withRetry";

export interface LeaderboardEntry {
  score_uuid: string;
  puzzle_id: string;
  player_name: string;
  time_taken_ms: number;
  created_at: string;
}

// crypto.randomUUID() needs a fairly recent browser (Chrome 92+, Safari
// 15.4+); older in-app/webview browsers can lack it entirely, which would
// otherwise throw before the insert even attempts to run.
function generateUuid(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export async function submitScore(
  puzzleId: string,
  playerName: string,
  timeTakenMs: number
) {
  const score_uuid = generateUuid();

  await withRetry(async () => {
    const { error } = await supabase.from("bible_puzzle_scores").insert([
      {
        score_uuid,
        puzzle_id: puzzleId,
        player_name: playerName,
        time_taken_ms: timeTakenMs,
      },
    ]);

    if (error) {
      if (error.code === "23505") return;
      throw error;
    }
  }, "submitScore");

  return { score_uuid };
}

export async function fetchLeaderboard(
  puzzleId: string,
  limit = 10
): Promise<LeaderboardEntry[]> {
  return withRetry(async () => {
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
  }, "fetchLeaderboard");
}
