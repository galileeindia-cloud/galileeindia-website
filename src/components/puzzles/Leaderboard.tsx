"use client";

import Link from "next/link";
import { Trophy } from "lucide-react";
import type { LeaderboardEntry } from "@/services/leaderboardService";
import { formatDuration } from "@/utils/time";

const MEDALS = ["🥇", "🥈", "🥉"];

type Props = {
  puzzleId: string;
  entries: LeaderboardEntry[];
  currentScoreUuid: string | null;
  loading: boolean;
  error: boolean;
};

export default function Leaderboard({
  puzzleId,
  entries,
  currentScoreUuid,
  loading,
  error,
}: Props) {
  return (
    <div className="mt-8 text-left">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Trophy size={18} className="text-blue-900" />
        <h3 className="font-bold text-blue-900">Leaderboard</h3>
      </div>

      {loading && (
        <p className="text-center text-sm text-gray-500">Loading leaderboard…</p>
      )}

      {!loading && error && (
        <p className="text-center text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg py-3 px-4">
          ⚠️ Your score wasn&rsquo;t saved to the leaderboard — something went
          wrong submitting it. Your puzzle time still counts, but you may want
          to try again later so it gets recorded.
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <p className="text-center text-sm text-gray-500">
          You&rsquo;re the first one on the leaderboard!
        </p>
      )}

      {!loading && !error && entries.length > 0 && (
        <ol className="flex flex-col gap-2">
          {entries.map((entry, index) => {
            const isCurrent = entry.score_uuid === currentScoreUuid;
            return (
              <li
                key={entry.score_uuid}
                className={`flex items-center gap-3 rounded-xl border px-4 py-2.5 ${
                  isCurrent
                    ? "border-blue-400 bg-blue-50"
                    : "border-gray-100 bg-gray-50"
                }`}
              >
                <span className="w-7 shrink-0 text-center font-bold text-blue-900">
                  {MEDALS[index] ?? `#${index + 1}`}
                </span>

                <span
                  className={`flex-1 truncate ${
                    isCurrent ? "font-bold text-blue-900" : "font-medium text-gray-900"
                  }`}
                >
                  {entry.player_name}
                  {isCurrent && <span className="ml-2 text-xs">(you)</span>}
                </span>

                <span className="shrink-0 text-sm text-gray-600">
                  {formatDuration(entry.time_taken_ms)}
                </span>
              </li>
            );
          })}
        </ol>
      )}

      {!loading && !error && (
        <div className="flex justify-center mt-4">
          <Link
            href={`/bible-puzzle/${puzzleId}/leaderboard`}
            className="text-sm font-semibold text-blue-700 hover:underline"
          >
            See full leaderboard
          </Link>
        </div>
      )}
    </div>
  );
}
