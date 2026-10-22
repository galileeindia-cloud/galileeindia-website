"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Lightbulb, LayoutGrid, RotateCcw, Undo2 } from "lucide-react";
import Celebration from "./Celebration";
import Leaderboard from "./Leaderboard";
import {
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
} from "@/services/leaderboardService";
import { formatDuration } from "@/utils/time";
import { graphemes } from "@/utils/text";
import { generateWordSearchLayout } from "@/utils/wordSearchLayout";
import type { GridCell } from "@/data/biblePuzzles";

type Phase = "name" | "playing" | "complete";

const NAME_STORAGE_KEY = "biblePuzzlePlayerName";

// One entry per word, cycled with `% WORD_COLORS.length` — sized to 17
// (the current largest puzzle has 14 words) so every word in a puzzle
// gets a genuinely distinct color instead of two words sharing one.
const WORD_COLORS = [
  { fill: "bg-red-500 border-red-600 text-white", soft: "bg-red-50 border-red-200 text-red-900", ring: "ring-red-400" },
  { fill: "bg-orange-500 border-orange-600 text-white", soft: "bg-orange-50 border-orange-200 text-orange-900", ring: "ring-orange-400" },
  { fill: "bg-amber-500 border-amber-600 text-white", soft: "bg-amber-50 border-amber-200 text-amber-900", ring: "ring-amber-400" },
  { fill: "bg-yellow-500 border-yellow-600 text-white", soft: "bg-yellow-50 border-yellow-200 text-yellow-900", ring: "ring-yellow-400" },
  { fill: "bg-lime-500 border-lime-600 text-white", soft: "bg-lime-50 border-lime-200 text-lime-900", ring: "ring-lime-400" },
  { fill: "bg-green-500 border-green-600 text-white", soft: "bg-green-50 border-green-200 text-green-900", ring: "ring-green-400" },
  { fill: "bg-emerald-500 border-emerald-600 text-white", soft: "bg-emerald-50 border-emerald-200 text-emerald-900", ring: "ring-emerald-400" },
  { fill: "bg-teal-500 border-teal-600 text-white", soft: "bg-teal-50 border-teal-200 text-teal-900", ring: "ring-teal-400" },
  { fill: "bg-cyan-500 border-cyan-600 text-white", soft: "bg-cyan-50 border-cyan-200 text-cyan-900", ring: "ring-cyan-400" },
  { fill: "bg-sky-500 border-sky-600 text-white", soft: "bg-sky-50 border-sky-200 text-sky-900", ring: "ring-sky-400" },
  { fill: "bg-blue-500 border-blue-600 text-white", soft: "bg-blue-50 border-blue-200 text-blue-900", ring: "ring-blue-400" },
  { fill: "bg-indigo-500 border-indigo-600 text-white", soft: "bg-indigo-50 border-indigo-200 text-indigo-900", ring: "ring-indigo-400" },
  { fill: "bg-violet-500 border-violet-600 text-white", soft: "bg-violet-50 border-violet-200 text-violet-900", ring: "ring-violet-400" },
  { fill: "bg-purple-500 border-purple-600 text-white", soft: "bg-purple-50 border-purple-200 text-purple-900", ring: "ring-purple-400" },
  { fill: "bg-fuchsia-500 border-fuchsia-600 text-white", soft: "bg-fuchsia-50 border-fuchsia-200 text-fuchsia-900", ring: "ring-fuchsia-400" },
  { fill: "bg-pink-500 border-pink-600 text-white", soft: "bg-pink-50 border-pink-200 text-pink-900", ring: "ring-pink-400" },
  { fill: "bg-rose-500 border-rose-600 text-white", soft: "bg-rose-50 border-rose-200 text-rose-900", ring: "ring-rose-400" },
];

// Same hues as WORD_COLORS (Tailwind 500s), for drawing found words as
// connected strips in the "board" design.
const WORD_HEX = [
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
  "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e",
];

// The board design picks hues from WORD_COLORS / WORD_HEX in this order, so
// neighbouring words never get near-identical colours (red, orange, amber
// and yellow all look alike as strips).
const BOARD_COLOR_ORDER = [0, 10, 5, 13, 1, 15, 7, 11, 2, 16, 8, 4, 12, 14, 6, 9, 3];

// Each hint reveals one more letter of an unfound word and adds this much
// to the player's time, so hinted runs don't outrank unhinted ones.
const HINT_PENALTY_MS = 15_000;

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
  grid: initialGrid,
  words,
  wordPaths: initialWordPaths,
  randomize = false,
  design,
}: {
  puzzleId: string;
  cols: number;
  grid: string[][];
  words: string[];
  wordPaths: GridCell[][];
  /** When true, a fresh random layout (scattered, non-overlapping paths)
   * is generated each time the puzzle starts or restarts, instead of
   * reusing the same pre-authored grid every play. */
  randomize?: boolean;
  /** "board": one connected board with found words drawn as strips, plus
   * Undo and Hint buttons. */
  design?: "board";
}) {
  // Which WORD_COLORS / WORD_HEX entry word `i` uses.
  const colorIndex = (i: number) =>
    design === "board" ? BOARD_COLOR_ORDER[i % BOARD_COLOR_ORDER.length] : i % WORD_COLORS.length;

  const [layout, setLayout] = useState({ grid: initialGrid, wordPaths: initialWordPaths });
  const { grid, wordPaths } = layout;

  function reshuffleLayout() {
    if (!randomize) return;
    setLayout(
      generateWordSearchLayout(words, initialGrid.length, cols, {
        grid: initialGrid,
        wordPaths: initialWordPaths,
      })
    );
  }

  const pathCellSet = new Set(wordPaths.flat().map(cellKey));
  function isBlockedCell(cell: GridCell) {
    return !pathCellSet.has(cellKey(cell));
  }

  const [phase, setPhase] = useState<Phase>("name");
  const [name, setName] = useState("");
  const [solved, setSolved] = useState<boolean[]>(() => words.map(() => false));
  // Order words were found in, so Undo removes the most recent one.
  const [solvedOrder, setSolvedOrder] = useState<number[]>([]);
  // How many letters of each word a hint has revealed.
  const [hints, setHints] = useState<number[]>(() => words.map(() => 0));
  const [penaltyMs, setPenaltyMs] = useState(0);
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

  const letterAt = ([r, c]: GridCell) => grid[r][c];

  /** Every orthogonal path through `pool` cells spelling `letters`, in order. */
  function pathsWithin(pool: Set<string>, letters: string[]): GridCell[][] {
    const found: GridCell[][] = [];
    const extend = (path: GridCell[]) => {
      if (found.length >= 200) return;
      if (path.length === letters.length) {
        found.push(path);
        return;
      }
      const [r, c] = path[path.length - 1];
      for (const next of [[r + 1, c], [r - 1, c], [r, c + 1], [r, c - 1]] as GridCell[]) {
        const key = cellKey(next);
        if (pool.has(key) && !path.some((p) => cellKey(p) === key) && letterAt(next) === letters[path.length]) {
          extend([...path, next]);
        }
      }
    };
    for (const key of pool) {
      const start = key.split(",").map(Number) as GridCell;
      if (letterAt(start) === letters[0]) extend([start]);
    }
    return found;
  }

  /**
   * If `attempt` spells an unfound word along a path other than the planned
   * one, re-plans that word and every unfound word it overlaps so they still
   * fit together. Returns the new paths, or null if the attempt spells
   * nothing or would leave the puzzle unsolvable.
   */
  function rerouteWord(attempt: GridCell[]): { index: number; wordPaths: GridCell[][] } | null {
    const spelled = attempt.map(letterAt);
    for (let i = 0; i < wordPaths.length; i++) {
      if (solvedRef.current[i] || wordPaths[i].length !== attempt.length) continue;
      const target = wordPaths[i].map(letterAt);
      const same = (a: string[]) => a.every((ch, k) => ch === target[k]);
      const path = same(spelled) ? attempt : same([...spelled].reverse()) ? [...attempt].reverse() : null;
      if (!path) continue;

      const used = new Set(path.map(cellKey));
      const affected = wordPaths
        .map((_, j) => j)
        .filter((j) => j !== i && !solvedRef.current[j] && wordPaths[j].some((cell) => used.has(cellKey(cell))));
      const pool = new Set(
        [i, ...affected].flatMap((j) => wordPaths[j].map(cellKey)).filter((key) => !used.has(key))
      );

      // Backtracking: give each displaced word a path from the leftover cells.
      const assigned = new Map<number, GridCell[]>();
      const place = (k: number, free: Set<string>): boolean => {
        if (k === affected.length) return true;
        const j = affected[k];
        for (const option of pathsWithin(free, wordPaths[j].map(letterAt))) {
          const rest = new Set(free);
          option.forEach((cell) => rest.delete(cellKey(cell)));
          assigned.set(j, option);
          if (place(k + 1, rest)) return true;
        }
        return false;
      };
      if (!place(0, pool)) continue;

      return {
        index: i,
        wordPaths: wordPaths.map((wp, j) => (j === i ? path : (assigned.get(j) ?? wp))),
      };
    }
    return null;
  }

  function endDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;

    const attempt = dragPathRef.current;
    let matchIndex = wordPaths.findIndex(
      (wp, i) =>
        !solvedRef.current[i] &&
        (pathsEqual(wp, attempt) || pathsEqual(wp, [...attempt].reverse()))
    );

    // Not the planned path, but it may still spell an unfound word: words
    // often share letters (1-/2-TIMOTHY end the same), so a correct trace
    // can wander onto another word's cells. Accept it if the words it
    // displaced can still be completed from the leftover cells.
    if (matchIndex === -1 && attempt.length > 1) {
      const rerouted = rerouteWord(attempt);
      if (rerouted) {
        matchIndex = rerouted.index;
        setLayout((prev) => ({ ...prev, wordPaths: rerouted.wordPaths }));
      }
    }

    if (matchIndex !== -1) {
      setSolvedOrder((prev) => [...prev, matchIndex]);
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
    // `wordPaths` is a dependency (not just an empty array) so that when
    // `randomize` reshuffles the layout, these listeners get re-registered
    // with fresh closures over the new paths — otherwise `extendDrag` and
    // `endDrag` would keep checking drags against the very first layout
    // generated at mount, and a solved word would never register.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wordPaths]);

  useEffect(() => {
    if (phase !== "playing") return;
    if (!solved.every(Boolean)) return;
    if (!startTime) return;

    const elapsed = Date.now() - startTime + penaltyMs;
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
    reshuffleLayout();
    setSolved(words.map(() => false));
    setSolvedOrder([]);
    setHints(words.map(() => 0));
    setPenaltyMs(0);
    setDrag([]);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function restart() {
    reshuffleLayout();
    setSolved(words.map(() => false));
    setSolvedOrder([]);
    setHints(words.map(() => 0));
    setPenaltyMs(0);
    setDrag([]);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  const elapsedMs = startTime ? now - startTime + penaltyMs : 0;

  function undo() {
    const last = solvedOrder[solvedOrder.length - 1];
    if (last === undefined) return;
    setSolvedOrder(solvedOrder.slice(0, -1));
    setSolved((prev) => prev.map((v, i) => (i === last ? false : v)));
  }

  // Reveals the next letter of the first unfound word that still has
  // letters left to reveal.
  function hint() {
    const index = words.findIndex((_, i) => !solved[i] && hints[i] < wordPaths[i].length);
    if (index === -1) return;
    // Skip "-" separators: they're already shown, so a hint on one reveals nothing.
    let next = hints[index] + 1;
    while (next < wordPaths[index].length) {
      const [r, c] = wordPaths[index][next - 1];
      if (grid[r][c] !== "-") break;
      next++;
    }
    setHints((prev) => prev.map((v, i) => (i === index ? next : v)));
    setPenaltyMs((ms) => ms + HINT_PENALTY_MS);
  }

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
                className={`px-4 py-2 rounded-full font-semibold border ${WORD_COLORS[colorIndex(i)].soft}`}
              >
                {word}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition"
            >
              <RotateCcw size={18} />
              Play Again
            </button>

            <Link
              href="/bible-puzzle"
              prefetch={false}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              <LayoutGrid size={18} />
              Explore All Puzzles
            </Link>
          </div>

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

  if (design === "board") {
    const rows = grid.length;
    const center = ([r, c]: GridCell) => [c * 100 + 50, r * 100 + 50] as const;
    const isPlayable = (r: number, c: number) =>
      r >= 0 && r < rows && c >= 0 && c < cols && !isBlockedCell([r, c]);
    const hintedCells = new Set(
      wordPaths.flatMap((wp, i) => (solved[i] ? [] : wp.slice(0, hints[i]).map(cellKey)))
    );
    const lastFound = solvedOrder[solvedOrder.length - 1];
    const chipLetters =
      dragPath.length > 0
        ? dragPath.map(([r, c]) => grid[r][c])
        : lastFound !== undefined
          ? wordPaths[lastFound].map(([r, c]) => grid[r][c])
          : [];
    const chipColor = dragPath.length > 0 ? "#818cf8" : lastFound !== undefined ? WORD_HEX[colorIndex(lastFound)] : "";
    const canHint = words.some((_, i) => !solved[i] && hints[i] < wordPaths[i].length);

    // One strip per found word (and the word being dragged): a thick
    // rounded line through the cell centers, the first letter circled,
    // and small chevrons showing the reading direction.
    const strip = (path: GridCell[], color: string, key: string) => (
      <g key={key}>
        {path.length > 1 && (
          <polyline
            points={path.map((cell) => center(cell).join(",")).join(" ")}
            fill="none"
            stroke={color}
            strokeWidth={76}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        <circle cx={center(path[0])[0]} cy={center(path[0])[1]} r={38} fill={color} stroke="#ffffff" strokeWidth={5} />
        {path.slice(1).map((cell, i) => {
          const [x1, y1] = center(path[i]);
          const [x2, y2] = center(cell);
          const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
          return (
            <path
              key={i}
              d="M -6 -10 L 5 0 L -6 10"
              fill="none"
              stroke="#ffffff"
              strokeWidth={5}
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0.85}
              transform={`translate(${(x1 + x2) / 2} ${(y1 + y2) / 2}) rotate(${angle})`}
            />
          );
        })}
      </g>
    );

    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-gray-600">
            Go, <span className="font-semibold text-blue-900">{name}</span>!
          </p>
          <p className="font-mono text-lg font-bold text-blue-900">
            ⏱ {formatDuration(elapsedMs)}
          </p>
        </div>

        <p className="text-center text-sm text-gray-500 mb-3">
          Press and drag across connected letters, then release to check.
        </p>

        <div className="flex justify-center select-none touch-none">
          <div
            ref={gridRef}
            className="relative grid bg-white border-[3px] border-zinc-700 rounded-xl overflow-hidden"
            style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
          >
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${cols * 100} ${rows * 100}`}
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {wordPaths.map((wp, i) => (solved[i] ? strip(wp, WORD_HEX[colorIndex(i)], `w${i}`) : null))}
              {dragPath.length > 0 && strip(dragPath, "#818cf8", "drag")}
            </svg>

            {grid.map((rowCells, r) =>
              rowCells.map((letter, c) => {
                const cell: GridCell = [r, c];
                const size = "w-9 h-9 sm:w-14 sm:h-14";

                if (!isPlayable(r, c)) {
                  return <div key={cellKey(cell)} data-row={r} data-col={c} className={`${size} bg-zinc-300`} />;
                }

                // A thick line wherever the playable area meets a blocked
                // cell, so the board's outline follows its irregular shape.
                const edge = "#3f3f46";
                const shadows = [
                  r > 0 && !isPlayable(r - 1, c) && `inset 0 3px 0 ${edge}`,
                  r < rows - 1 && !isPlayable(r + 1, c) && `inset 0 -3px 0 ${edge}`,
                  c > 0 && !isPlayable(r, c - 1) && `inset 3px 0 0 ${edge}`,
                  c < cols - 1 && !isPlayable(r, c + 1) && `inset -3px 0 0 ${edge}`,
                ].filter(Boolean);

                const onStrip =
                  dragPath.some((dc) => cellKey(dc) === cellKey(cell)) ||
                  wordPaths.some((wp, i) => solved[i] && wp.some((wc) => cellKey(wc) === cellKey(cell)));
                const hinted = !onStrip && hintedCells.has(cellKey(cell));

                return (
                  <div
                    key={cellKey(cell)}
                    data-row={r}
                    data-col={c}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      beginDrag(cell);
                    }}
                    className={`${size} relative flex items-center justify-center border-r border-b border-zinc-200 font-bold uppercase text-base sm:text-xl select-none touch-none ${
                      onStrip ? "text-white" : hinted ? "text-amber-700" : "text-zinc-800"
                    }`}
                    style={{ boxShadow: shadows.join(", ") || undefined }}
                  >
                    {hinted && (
                      <span className="absolute inset-1 rounded-full border-2 border-dashed border-amber-500" aria-hidden="true" />
                    )}
                    <span className="relative">{letter}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* The letters being traced, or the last word found. */}
        <div className="flex justify-center gap-1 my-4 min-h-[2rem]">
          {chipLetters.map((letter, i) => (
            <span
              key={i}
              className="w-7 h-8 flex items-center justify-center rounded-md text-white font-bold uppercase text-sm"
              style={{ backgroundColor: chipColor }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* One row of tiles per word, showing its length. */}
        <div className="flex flex-col items-start gap-2 w-fit mx-auto mb-5">
          {words.map((word, i) => (
            <div key={word} className="flex gap-px sm:gap-1">
              {graphemes(word).map((ch, j) => {
                const isSeparator = ch === "-";
                const color = WORD_HEX[colorIndex(i)];
                const shown = solved[i] || isSeparator || j < hints[i];
                return (
                  <span
                    key={j}
                    className={`w-[18px] h-6 sm:w-7 sm:h-8 flex items-center justify-center rounded font-bold text-[11px] sm:text-sm ${
                      solved[i] ? "text-white" : shown ? "bg-zinc-200 text-zinc-600" : "bg-zinc-200 text-transparent"
                    }`}
                    style={solved[i] ? { backgroundColor: color } : undefined}
                  >
                    {shown ? ch : "•"}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
          <button
            type="button"
            onClick={undo}
            disabled={solvedOrder.length === 0}
            className="inline-flex items-center justify-center gap-2 py-2.5 rounded-full border border-zinc-600 text-zinc-800 font-medium hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Undo2 size={16} />
            Undo
          </button>
          <button
            type="button"
            onClick={hint}
            disabled={!canHint}
            className="inline-flex items-center justify-center gap-2 py-2.5 rounded-full border border-zinc-600 text-zinc-800 font-medium hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Lightbulb size={16} />
            Hint
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          Each hint reveals one letter and adds {HINT_PENALTY_MS / 1000} seconds to your time.
        </p>

        <div className="flex justify-center mt-4">
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

      <p className="text-center text-sm text-gray-500 mb-2">
        Press and drag across connected letters, then release to check.
      </p>

      {/* Live readout of the letters traced so far, so the player can see
          the word taking shape mid-drag instead of only after release. */}
      <p className="text-center text-xl sm:text-2xl font-bold tracking-[0.3em] text-indigo-700 mb-4 min-h-[2rem]">
        {dragPath.map(([r, c]) => grid[r][c]).join("")}
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
                // The fill color alone can blend into a neighboring solved
                // word's cells when they're adjacent in the grid; the ring
                // keeps each found word visually outlined as its own shape.
                className += `${WORD_COLORS[solvedWordIndex % WORD_COLORS.length].fill} ring-2 ring-offset-1 ${WORD_COLORS[solvedWordIndex % WORD_COLORS.length].ring}`;
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
          <div
            key={word}
            className={`flex gap-1 p-1 rounded-lg transition ${
              solved[i] ? `ring-2 ring-offset-2 ${WORD_COLORS[i % WORD_COLORS.length].ring}` : ""
            }`}
          >
            {graphemes(word).map((ch, j) => {
              // A literal "-" is a fixed separator, not a hidden letter, so
              // it's shown from the moment the puzzle loads rather than
              // waiting behind the "•" placeholder like the real letters.
              const isSeparator = ch === "-";
              const revealed = solved[i] || isSeparator;
              return (
                <span
                  key={j}
                  className={`w-7 h-8 sm:w-8 sm:h-9 flex items-center justify-center rounded border font-bold text-sm sm:text-base ${
                    solved[i]
                      ? WORD_COLORS[i % WORD_COLORS.length].fill
                      : isSeparator
                        ? "bg-white border-gray-300 text-gray-400"
                        : "bg-white border-gray-300 text-transparent"
                  }`}
                >
                  {revealed ? ch : "•"}
                </span>
              );
            })}
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
