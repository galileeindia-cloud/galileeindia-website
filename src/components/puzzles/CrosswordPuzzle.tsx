"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { RotateCcw } from "lucide-react";
import Celebration from "./Celebration";
import Leaderboard from "./Leaderboard";
import {
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
} from "@/services/leaderboardService";
import { formatDuration } from "@/utils/time";
import type { CrosswordEntry } from "@/data/biblePuzzles";

type Phase = "name" | "playing" | "complete";
type Direction = "across" | "down";
type CellRef = { across?: number; down?: number };

const NAME_STORAGE_KEY = "biblePuzzlePlayerName";

const cellKey = (row: number, col: number) => `${row},${col}`;
const otherDirection = (dir: Direction): Direction =>
  dir === "across" ? "down" : "across";

function buildLayout(rows: number, cols: number, entries: CrosswordEntry[]) {
  const solution: (string | null)[][] = Array.from({ length: rows }, () =>
    Array(cols).fill(null)
  );
  const numbers = new Map<string, number>();
  const cellEntries = new Map<string, CellRef>();

  entries.forEach((entry, index) => {
    numbers.set(cellKey(entry.row, entry.col), entry.clueNumber);
    [...entry.answer].forEach((letter, i) => {
      const row = entry.row + (entry.direction === "down" ? i : 0);
      const col = entry.col + (entry.direction === "across" ? i : 0);
      solution[row][col] = letter;
      const ref = cellEntries.get(cellKey(row, col)) ?? {};
      ref[entry.direction] = index;
      cellEntries.set(cellKey(row, col), ref);
    });
  });

  return { solution, numbers, cellEntries };
}

function entryCells(entry: CrosswordEntry) {
  return [...entry.answer].map((_, i) => ({
    row: entry.row + (entry.direction === "down" ? i : 0),
    col: entry.col + (entry.direction === "across" ? i : 0),
  }));
}

export default function CrosswordPuzzle({
  puzzleId,
  rows,
  cols,
  entries,
}: {
  puzzleId: string;
  rows: number;
  cols: number;
  entries: CrosswordEntry[];
}) {
  const layout = useMemo(() => buildLayout(rows, cols, entries), [rows, cols, entries]);
  const emptyValues = () => Array.from({ length: rows }, () => Array<string>(cols).fill(""));

  const [phase, setPhase] = useState<Phase>("name");
  const [name, setName] = useState("");
  const [values, setValues] = useState<string[][]>(emptyValues);
  const [active, setActive] = useState({ row: entries[0].row, col: entries[0].col });
  const [dir, setDir] = useState<Direction>(entries[0].direction);
  const [showWrong, setShowWrong] = useState(false);
  const inputRefs = useRef(new Map<string, HTMLInputElement>());

  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [finishedMs, setFinishedMs] = useState<number | null>(null);

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

  useEffect(() => {
    if (phase !== "playing") return;
    inputRefs.current.get(cellKey(active.row, active.col))?.focus();
  }, [active, phase]);

  async function recordScore(timeTakenMs: number) {
    setLeaderboardLoading(true);
    setLeaderboardError(false);
    try {
      const { score_uuid } = await submitScore(puzzleId, name, timeTakenMs);
      setCurrentScoreUuid(score_uuid);
      const rowsFromDb = await fetchLeaderboard(puzzleId);
      setLeaderboard(rowsFromDb);
    } catch (err) {
      console.error("Leaderboard submit/fetch failed:", err);
      setLeaderboardError(true);
    } finally {
      setLeaderboardLoading(false);
    }
  }

  function resetRun() {
    setValues(emptyValues());
    setActive({ row: entries[0].row, col: entries[0].col });
    setDir(entries[0].direction);
    setShowWrong(false);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function startPuzzle() {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    setName(trimmed);
    resetRun();
  }

  function isSolved(candidate: string[][]) {
    return layout.solution.every((rowCells, r) =>
      rowCells.every((letter, c) => letter === null || candidate[r][c] === letter)
    );
  }

  function finish() {
    if (!startTime) return;
    // Only reached from input event handlers, never during render.
    // eslint-disable-next-line react-hooks/purity
    const elapsed = Date.now() - startTime;
    setFinishedMs(elapsed);
    setPhase("complete");
    recordScore(elapsed);
  }

  function moveTo(row: number, col: number, preferred: Direction) {
    const ref = layout.cellEntries.get(cellKey(row, col));
    if (!ref) return;
    setActive({ row, col });
    setDir(ref[preferred] !== undefined ? preferred : otherDirection(preferred));
  }

  function selectCell(row: number, col: number) {
    const ref = layout.cellEntries.get(cellKey(row, col));
    if (!ref) return;
    if (row === active.row && col === active.col) {
      if (ref.across !== undefined && ref.down !== undefined) setDir(otherDirection(dir));
      return;
    }
    moveTo(row, col, dir);
  }

  function step(row: number, col: number, delta: 1 | -1) {
    return {
      row: row + (dir === "down" ? delta : 0),
      col: col + (dir === "across" ? delta : 0),
    };
  }

  function handleInput(row: number, col: number, raw: string) {
    const letter = raw.slice(-1).toUpperCase();
    if (letter && !/^\p{L}$/u.test(letter)) return;

    const next = values.map((r) => [...r]);
    next[row][col] = letter;
    setValues(next);
    setShowWrong(false);

    if (letter && isSolved(next)) {
      finish();
      return;
    }
    if (letter) {
      const forward = step(row, col, 1);
      if (layout.solution[forward.row]?.[forward.col]) {
        setActive(forward);
      }
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>, row: number, col: number) {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (values[row][col]) {
        handleInput(row, col, "");
        return;
      }
      const back = step(row, col, -1);
      if (layout.solution[back.row]?.[back.col]) {
        const next = values.map((r) => [...r]);
        next[back.row][back.col] = "";
        setValues(next);
        setShowWrong(false);
        setActive(back);
      }
      return;
    }

    const arrows: Record<string, [number, number, Direction]> = {
      ArrowLeft: [0, -1, "across"],
      ArrowRight: [0, 1, "across"],
      ArrowUp: [-1, 0, "down"],
      ArrowDown: [1, 0, "down"],
    };
    const arrow = arrows[e.key];
    if (arrow) {
      e.preventDefault();
      const [dr, dc, direction] = arrow;
      moveTo(row + dr, col + dc, direction);
    }
  }

  function selectEntry(index: number) {
    const entry = entries[index];
    const cells = entryCells(entry);
    const firstEmpty = cells.find(({ row, col }) => !values[row][col]) ?? cells[0];
    setActive(firstEmpty);
    setDir(entry.direction);
  }

  const activeRef = layout.cellEntries.get(cellKey(active.row, active.col));
  const activeEntryIndex = activeRef?.[dir] ?? activeRef?.[otherDirection(dir)];
  const activeEntry = activeEntryIndex !== undefined ? entries[activeEntryIndex] : null;
  const activeWord = new Set(
    activeEntry ? entryCells(activeEntry).map(({ row, col }) => cellKey(row, col)) : []
  );
  const entryDone = (entry: CrosswordEntry) =>
    entryCells(entry).every(
      ({ row, col }) => values[row][col] === layout.solution[row][col]
    );

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

          <p className="text-lg text-gray-700 mb-6">
            You solved all {entries.length} clues in{" "}
            <span className="font-bold text-blue-900">
              {formatDuration(finishedMs ?? 0)}
            </span>
            . Well done! 🙌
          </p>

          <button
            type="button"
            onClick={resetRun}
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

      <p className="text-center text-sm text-gray-500 mb-3 min-h-[2.5rem]">
        {activeEntry ? (
          <>
            <span className="font-bold text-blue-900">
              {activeEntry.clueNumber} {activeEntry.direction === "across" ? "Across" : "Down"}
            </span>
            : {activeEntry.clue} ({activeEntry.answer.length})
          </>
        ) : (
          "Tap a square, then type your answer."
        )}
      </p>

      <div className="flex flex-col lg:flex-row lg:items-start gap-8">
        <div className="flex justify-center lg:flex-1 overflow-x-auto pb-2">
          <div
            className="grid gap-0.5 bg-blue-950 p-0.5 rounded-md w-max"
            style={{ gridTemplateColumns: `repeat(${cols}, max-content)` }}
          >
            {layout.solution.map((rowCells, r) =>
              rowCells.map((solutionLetter, c) => {
                const k = cellKey(r, c);
                if (solutionLetter === null) {
                  return <div key={k} className="w-7 h-7 sm:w-10 sm:h-10 bg-blue-950" />;
                }

                const value = values[r][c];
                const isActive = r === active.row && c === active.col;
                const wrong = showWrong && value !== "" && value !== solutionLetter;
                const shade = wrong
                  ? "bg-rose-100 text-rose-700"
                  : isActive
                    ? "bg-amber-200 text-blue-950"
                    : activeWord.has(k)
                      ? "bg-blue-100 text-blue-950"
                      : "bg-white text-blue-950";
                const number = layout.numbers.get(k);

                return (
                  <div key={k} className="relative w-7 h-7 sm:w-10 sm:h-10">
                    {number !== undefined && (
                      <span className="absolute top-0 left-0.5 text-[9px] sm:text-[10px] leading-none font-semibold text-gray-500 pointer-events-none z-10">
                        {number}
                      </span>
                    )}
                    <input
                      ref={(el) => {
                        if (el) inputRefs.current.set(k, el);
                        else inputRefs.current.delete(k);
                      }}
                      value={value}
                      // onInput, not onChange: React skips onChange when the typed
                      // letter equals the letter already selected in a crossing cell,
                      // which would stop the cursor from advancing.
                      onInput={(e) => handleInput(r, c, e.currentTarget.value)}
                      onChange={() => {}}
                      onKeyDown={(e) => handleKeyDown(e, r, c)}
                      onClick={() => selectCell(r, c)}
                      onFocus={(e) => e.currentTarget.select()}
                      aria-label={`Row ${r + 1}, column ${c + 1}`}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="characters"
                      spellCheck={false}
                      className={`w-full h-full text-center font-bold uppercase text-base sm:text-lg caret-transparent focus:outline-none ${shade}`}
                    />
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-1 gap-6 lg:w-80">
          {(["across", "down"] as const).map((direction) => (
            <div key={direction}>
              <h3 className="text-sm font-semibold tracking-widest text-blue-700 uppercase mb-2">
                {direction === "across" ? "Across" : "Down"}
              </h3>
              <ol className="flex flex-col gap-1">
                {entries.map((entry, index) =>
                  entry.direction !== direction ? null : (
                    <li key={index}>
                      <button
                        type="button"
                        onClick={() => selectEntry(index)}
                        className={`w-full text-left text-sm rounded-lg px-3 py-2 transition ${
                          index === activeEntryIndex
                            ? "bg-blue-100 text-blue-950"
                            : "bg-white text-gray-700 hover:bg-gray-100"
                        } ${entryDone(entry) ? "line-through text-gray-400" : ""}`}
                      >
                        <span className="font-bold mr-1">{entry.clueNumber}.</span>
                        {entry.clue} ({entry.answer.length})
                      </button>
                    </li>
                  )
                )}
              </ol>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-4 mt-8">
        <button
          type="button"
          onClick={() => setShowWrong(true)}
          className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          Check Letters
        </button>
        <button
          type="button"
          onClick={resetRun}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
