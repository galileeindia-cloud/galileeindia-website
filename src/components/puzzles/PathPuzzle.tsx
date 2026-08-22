"use client";

import { useEffect, useState } from "react";
import { RotateCcw, Lightbulb } from "lucide-react";
import Celebration from "./Celebration";
import Leaderboard from "./Leaderboard";
import {
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
} from "@/services/leaderboardService";
import { formatDuration } from "@/utils/time";
import type { GridCell } from "@/data/biblePuzzles";

type Phase = "name" | "playing" | "complete";

const NAME_STORAGE_KEY = "biblePuzzlePlayerName";

function cellKey([r, c]: GridCell) {
  return `${r},${c}`;
}

function isAdjacent(a: GridCell, b: GridCell) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

/** Longest run of `path` cells (from the start) that also appear as the
 * same prefix of `target`, used so Hint can recover gracefully from a
 * wrong turn rather than getting stuck. */
function commonPrefixLength(path: GridCell[], target: GridCell[]) {
  let i = 0;
  while (i < path.length && i < target.length && cellKey(path[i]) === cellKey(target[i])) {
    i++;
  }
  return i;
}

export default function PathPuzzle({
  puzzleId,
  cols,
  grid,
  blocked,
  path: targetPath,
  words,
}: {
  puzzleId: string;
  cols: number;
  grid: (string | null)[][];
  blocked: GridCell[];
  path: GridCell[];
  words: string[];
}) {
  const blockedSet = new Set(blocked.map(cellKey));

  const [phase, setPhase] = useState<Phase>("name");
  const [name, setName] = useState("");
  const [foundPath, setFoundPath] = useState<GridCell[]>([]);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [finishedMs, setFinishedMs] = useState<number | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [currentScoreUuid, setCurrentScoreUuid] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(NAME_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setName(saved);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  async function recordScore(timeTakenMs: number) {
    setLeaderboardLoading(true);
    setLeaderboardError(false);
    try {
      const { score_uuid } = await submitScore(puzzleId, name, timeTakenMs);
      setCurrentScoreUuid(score_uuid);
      const entries = await fetchLeaderboard(puzzleId);
      setLeaderboard(entries);
    } catch (err) {
      console.error("Leaderboard submit/fetch failed:", err);
      setLeaderboardError(true);
    } finally {
      setLeaderboardLoading(false);
    }
  }

  useEffect(() => {
    if (phase !== "playing") return;
    if (foundPath.length !== targetPath.length) return;

    const isCorrect = foundPath.every((cell, i) => cellKey(cell) === cellKey(targetPath[i]));
    if (isCorrect && startTime) {
      const elapsed = Date.now() - startTime;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFinishedMs(elapsed);
      setPhase("complete");
      recordScore(elapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [foundPath, phase, startTime]);

  function startPuzzle() {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    setName(trimmed);
    setFoundPath([]);
    setHintsUsed(0);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function restart() {
    setFoundPath([]);
    setHintsUsed(0);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function tapCell(cell: GridCell) {
    if (blockedSet.has(cellKey(cell))) return;

    const indexInPath = foundPath.findIndex((c) => cellKey(c) === cellKey(cell));
    if (indexInPath !== -1) {
      // Tapping an already-selected cell retreats the path back to it.
      setFoundPath(foundPath.slice(0, indexInPath + 1));
      return;
    }

    if (foundPath.length === 0) {
      setFoundPath([cell]);
      return;
    }

    const last = foundPath[foundPath.length - 1];
    if (isAdjacent(last, cell)) {
      setFoundPath([...foundPath, cell]);
    }
  }

  function undo() {
    setFoundPath((prev) => prev.slice(0, -1));
  }

  function hint() {
    const keep = commonPrefixLength(foundPath, targetPath);
    const next = targetPath.slice(0, Math.min(keep + 1, targetPath.length));
    setFoundPath(next);
    setHintsUsed((n) => n + 1);
  }

  const elapsedMs = startTime ? now - startTime : 0;
  const foundLetters = foundPath.map(([r, c]) => grid[r][c]).join("");

  if (phase === "name") {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
        <h2 className="text-xl font-bold text-blue-900 mb-2">What&rsquo;s your name?</h2>
        <p className="text-gray-500 mb-6">
          We&rsquo;ll cheer for you by name when you finish!
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startPuzzle()}
          placeholder="Enter your name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={startPuzzle}
          disabled={!name.trim()}
          className="w-full px-6 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Puzzle
        </button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="max-w-lg mx-auto text-center">
        <Celebration />

        <div className="relative z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-10 animate-pop-in">
          <p className="text-5xl mb-4">🎉🌸✨</p>

          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-3">
            Congratulations, {name}!
          </h2>

          <p className="text-lg text-gray-700 mb-2">
            You uncovered all four names of Jesus in{" "}
            <span className="font-bold text-blue-900">
              {formatDuration(finishedMs ?? 0)}
            </span>
            . Well done! 🙌
          </p>

          <div className="flex flex-wrap justify-center gap-2 my-6">
            {words.map((word) => (
              <span
                key={word}
                className="px-4 py-2 rounded-full bg-blue-50 text-blue-900 font-semibold"
              >
                {word}
              </span>
            ))}
          </div>

          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition"
          >
            <RotateCcw size={18} />
            Play Again
          </button>

          <Leaderboard
            puzzleId={puzzleId}
            entries={leaderboard}
            currentScoreUuid={currentScoreUuid}
            loading={leaderboardLoading}
            error={leaderboardError}
          />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Go, <span className="font-semibold text-blue-900">{name}</span>!
        </p>
        <p className="font-mono text-lg font-bold text-blue-900">
          ⏱ {formatDuration(elapsedMs)}
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <div
          className="grid gap-1 sm:gap-1.5 bg-gray-100 p-2 sm:p-3 rounded-2xl"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((rowCells, r) =>
            rowCells.map((letter, c) => {
              const isBlocked = blockedSet.has(cellKey([r, c]));
              const pathIndex = foundPath.findIndex((cell) => cellKey(cell) === cellKey([r, c]));
              const isSelected = pathIndex !== -1;
              const isLast =
                foundPath.length > 0 && cellKey(foundPath[foundPath.length - 1]) === cellKey([r, c]);

              if (isBlocked) {
                return (
                  <div
                    key={cellKey([r, c])}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-md bg-gray-300"
                  />
                );
              }

              return (
                <button
                  key={cellKey([r, c])}
                  type="button"
                  onClick={() => tapCell([r, c])}
                  className={`w-9 h-9 sm:w-11 sm:h-11 rounded-md border-2 font-bold text-sm sm:text-base transition ${
                    isSelected
                      ? isLast
                        ? "bg-blue-900 border-blue-900 text-white"
                        : "bg-blue-100 border-blue-400 text-blue-900"
                      : "bg-white border-gray-200 text-gray-800 hover:border-blue-300"
                  }`}
                >
                  {letter}
                </button>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-col items-center gap-2 mb-8">
        {words.map((word) => {
          const wordStartsAt = words
            .slice(0, words.indexOf(word))
            .reduce((sum, w) => sum + w.replace(/\s/g, "").length, 0);

          return (
            <div key={word} className="flex flex-wrap justify-center gap-1">
              {word.split("").map((ch, i) => {
                if (ch === " ") {
                  return <span key={i} className="w-3" />;
                }
                const letterIndex =
                  wordStartsAt + word.slice(0, i).replace(/\s/g, "").length;
                const revealed = foundLetters[letterIndex];
                return (
                  <span
                    key={i}
                    className="w-7 h-8 sm:w-8 sm:h-9 flex items-center justify-center rounded bg-white border border-gray-300 font-bold text-gray-800 text-sm sm:text-base"
                  >
                    {revealed ?? ""}
                  </span>
                );
              })}
            </div>
          );
        })}
      </div>

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={undo}
          disabled={foundPath.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <RotateCcw size={16} />
          Undo
        </button>

        <button
          type="button"
          onClick={hint}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-amber-300 text-amber-700 font-semibold hover:bg-amber-50 transition"
        >
          <Lightbulb size={16} />
          Hint
        </button>
      </div>

      {hintsUsed > 0 && (
        <p className="text-center text-xs text-gray-400 mt-3">
          Hints used: {hintsUsed}
        </p>
      )}

      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={restart}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
