"use client";

import { useEffect, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
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

const WORD_COLORS = [
  { fill: "bg-blue-500 border-blue-600 text-white", soft: "bg-blue-50 border-blue-200 text-blue-900" },
  { fill: "bg-emerald-500 border-emerald-600 text-white", soft: "bg-emerald-50 border-emerald-200 text-emerald-900" },
  { fill: "bg-purple-500 border-purple-600 text-white", soft: "bg-purple-50 border-purple-200 text-purple-900" },
  { fill: "bg-amber-500 border-amber-600 text-white", soft: "bg-amber-50 border-amber-200 text-amber-900" },
  { fill: "bg-rose-500 border-rose-600 text-white", soft: "bg-rose-50 border-rose-200 text-rose-900" },
  { fill: "bg-cyan-500 border-cyan-600 text-white", soft: "bg-cyan-50 border-cyan-200 text-cyan-900" },
  { fill: "bg-lime-500 border-lime-600 text-white", soft: "bg-lime-50 border-lime-200 text-lime-900" },
];

function cellKey([r, c]: GridCell) {
  return `${r},${c}`;
}

function isAdjacent(a: GridCell, b: GridCell) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) === 1;
}

function pathsEqual(a: GridCell[], b: GridCell[]) {
  return a.length === b.length && a.every((cell, i) => cellKey(cell) === cellKey(b[i]));
}

export default function PathPuzzle({
  puzzleId,
  cols,
  grid,
  words,
  wordPaths,
}: {
  puzzleId: string;
  cols: number;
  grid: string[][];
  words: string[];
  wordPaths: GridCell[][];
}) {
  const pathCellSet = new Set(wordPaths.flat().map(cellKey));
  function isBlockedCell(cell: GridCell) {
    return !pathCellSet.has(cellKey(cell));
  }

  const [phase, setPhase] = useState<Phase>("name");
  const [name, setName] = useState("");
  const [solved, setSolved] = useState<boolean[]>(() => words.map(() => false));
  const [dragPath, setDragPath] = useState<GridCell[]>([]);
  const dragPathRef = useRef<GridCell[]>([]);
  const draggingRef = useRef(false);
  const solvedRef = useRef(solved);
  const gridRef = useRef<HTMLDivElement>(null);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [finishedMs, setFinishedMs] = useState<number | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [currentScoreUuid, setCurrentScoreUuid] = useState<string | null>(null);

  useEffect(() => {
    solvedRef.current = solved;
  }, [solved]);

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

  function setDrag(next: GridCell[]) {
    dragPathRef.current = next;
    setDragPath(next);
  }

  function cellFromPoint(x: number, y: number): GridCell | null {
    const el = document.elementFromPoint(x, y) as HTMLElement | null;
    const cellEl = el?.closest("[data-row]") as HTMLElement | null;
    if (!cellEl) return null;
    return [Number(cellEl.dataset.row), Number(cellEl.dataset.col)];
  }

  function isCellSolved(cell: GridCell) {
    return wordPaths.some(
      (wp, i) => solvedRef.current[i] && wp.some((c) => cellKey(c) === cellKey(cell))
    );
  }

  function beginDrag(cell: GridCell) {
    if (isCellSolved(cell) || isBlockedCell(cell)) return;
    draggingRef.current = true;
    setDrag([cell]);
  }

  function extendDrag(cell: GridCell) {
    if (!draggingRef.current || isCellSolved(cell) || isBlockedCell(cell)) return;
    const prev = dragPathRef.current;
    if (prev.length === 0) {
      setDrag([cell]);
      return;
    }
    const last = prev[prev.length - 1];
    if (cellKey(last) === cellKey(cell)) return;

    // Dragging back over the previous cell retreats by one step.
    if (prev.length >= 2 && cellKey(prev[prev.length - 2]) === cellKey(cell)) {
      setDrag(prev.slice(0, -1));
      return;
    }

    if (prev.some((c) => cellKey(c) === cellKey(cell))) return;
    if (!isAdjacent(last, cell)) return;
    setDrag([...prev, cell]);
  }

  function endDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const attempt = dragPathRef.current;
    const matchIndex = wordPaths.findIndex(
      (wp, i) =>
        !solvedRef.current[i] &&
        (pathsEqual(wp, attempt) || pathsEqual(wp, [...attempt].reverse()))
    );

    if (matchIndex !== -1) {
      setSolved((prevSolved) => {
        const next = [...prevSolved];
        next[matchIndex] = true;
        return next;
      });
    }

    setDrag([]);
  }

  useEffect(() => {
    function onPointerMove(e: PointerEvent) {
      if (!draggingRef.current) return;
      const cell = cellFromPoint(e.clientX, e.clientY);
      if (cell) extendDrag(cell);
    }
    function onPointerUp() {
      endDrag();
    }
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    if (!solved.every(Boolean)) return;
    if (!startTime) return;

    const elapsed = Date.now() - startTime;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFinishedMs(elapsed);
    setPhase("complete");
    recordScore(elapsed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved, phase, startTime]);

  function startPuzzle() {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    setName(trimmed);
    setSolved(words.map(() => false));
    setDrag([]);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function restart() {
    setSolved(words.map(() => false));
    setDrag([]);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  const elapsedMs = startTime ? now - startTime : 0;

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
            You found all {words.length} words in{" "}
            <span className="font-bold text-blue-900">
              {formatDuration(finishedMs ?? 0)}
            </span>
            . Well done! 🙌
          </p>

          <div className="flex flex-wrap justify-center gap-2 my-6">
            {words.map((word, i) => (
              <span
                key={word}
                className={`px-4 py-2 rounded-full font-semibold border ${WORD_COLORS[i % WORD_COLORS.length].soft}`}
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

      <p className="text-center text-sm text-gray-500 mb-4">
        Press and drag across connected letters, then release to check.
      </p>

      <div className="flex justify-center mb-8 select-none touch-none">
        <div
          ref={gridRef}
          className="grid gap-1 sm:gap-1.5 bg-gray-100 p-2 sm:p-3 rounded-2xl"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {grid.map((rowCells, r) =>
            rowCells.map((letter, c) => {
              const cell: GridCell = [r, c];

              if (isBlockedCell(cell)) {
                return (
                  <div
                    key={cellKey(cell)}
                    data-row={r}
                    data-col={c}
                    className="w-9 h-9 sm:w-11 sm:h-11 rounded-md bg-gray-400"
                  />
                );
              }

              const solvedWordIndex = wordPaths.findIndex(
                (wp, i) => solved[i] && wp.some((wc) => cellKey(wc) === cellKey(cell))
              );
              const isInDrag = dragPath.some((dc) => cellKey(dc) === cellKey(cell));

              let className =
                "w-9 h-9 sm:w-11 sm:h-11 rounded-md border-2 font-bold text-sm sm:text-base transition select-none touch-none ";
              if (solvedWordIndex !== -1) {
                className += WORD_COLORS[solvedWordIndex % WORD_COLORS.length].fill;
              } else if (isInDrag) {
                className += "bg-indigo-200 border-indigo-500 text-indigo-900";
              } else {
                className += "bg-white border-gray-200 text-gray-800";
              }

              return (
                <div
                  key={cellKey(cell)}
                  data-row={r}
                  data-col={c}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    beginDrag(cell);
                  }}
                  className={className}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center" }}
                >
                  {letter}
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mb-4">
        {words.map((word, i) => (
          <div key={word} className="flex gap-1">
            {word.split("").map((ch, j) => (
              <span
                key={j}
                className={`w-7 h-8 sm:w-8 sm:h-9 flex items-center justify-center rounded border font-bold text-sm sm:text-base ${
                  solved[i]
                    ? WORD_COLORS[i % WORD_COLORS.length].fill
                    : "bg-white border-gray-300 text-transparent"
                }`}
              >
                {solved[i] ? ch : "•"}
              </span>
            ))}
          </div>
        ))}
      </div>

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
