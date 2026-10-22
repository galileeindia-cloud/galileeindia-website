import { graphemes } from "./text";
import type { GridCell } from "@/data/biblePuzzles";

type Direction = [number, number];
const DIRECTIONS: Direction[] = [
  [-1, 0], // up
  [1, 0], // down
  [0, -1], // left
  [0, 1], // right
];

function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function key(r: number, c: number) {
  return `${r},${c}`;
}

// Bounded self-avoiding random walk: tries to lay `length` connected,
// unused cells starting at `start`, bending in a random direction at
// each step. The call budget keeps a doomed attempt (dead end deep in
// the grid) from blowing up — it just fails fast and the caller tries
// another starting cell instead.
function walk(
  start: GridCell,
  length: number,
  rows: number,
  cols: number,
  used: Set<string>,
  callBudget: { calls: number; max: number }
): GridCell[] | null {
  const [sr, sc] = start;
  if (sr < 0 || sr >= rows || sc < 0 || sc >= cols || used.has(key(sr, sc))) return null;

  const path: GridCell[] = [start];
  const visited = new Set<string>([key(sr, sc)]);

  function extend(): boolean {
    callBudget.calls++;
    if (callBudget.calls > callBudget.max) return false;
    if (path.length === length) return true;

    const [r, c] = path[path.length - 1];
    for (const [dr, dc] of shuffle(DIRECTIONS)) {
      const nr = r + dr;
      const nc = c + dc;
      const k = key(nr, nc);
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (used.has(k) || visited.has(k)) continue;

      path.push([nr, nc]);
      visited.add(k);
      if (extend()) return true;
      path.pop();
      visited.delete(k);
    }
    return false;
  }

  return extend() ? path : null;
}

// One attempt at placing every word as a random bent path with no two
// words sharing a cell. Longest words go first, while the grid is
// emptiest. Returns null if any word can't be seated — the caller
// just starts over with a fresh, fully random attempt.
function tryLayout(
  wordLetters: string[][],
  rows: number,
  cols: number,
  startsToTry: number,
  walkBudget: number
): GridCell[][] | null {
  const used = new Set<string>();
  const placedByOriginalIndex: GridCell[][] = new Array(wordLetters.length);

  const order = wordLetters
    .map((letters, index) => ({ letters, index }))
    .sort((a, b) => b.letters.length - a.letters.length);

  const allStarts: GridCell[] = Array.from({ length: rows * cols }, (_, i) => [
    Math.floor(i / cols),
    i % cols,
  ]);

  for (const { letters, index } of order) {
    const starts = shuffle(allStarts).slice(0, startsToTry);
    let placed: GridCell[] | null = null;
    for (const start of starts) {
      const path = walk(start, letters.length, rows, cols, used, { calls: 0, max: walkBudget });
      if (path) {
        placed = path;
        break;
      }
    }
    if (!placed) return null;
    placed.forEach(([r, c]) => used.add(key(r, c)));
    placedByOriginalIndex[index] = placed;
  }

  return placedByOriginalIndex;
}

// A rough "how bunched-up is this" score — the variance of how many
// active cells fall in each row and each column. Lower is more evenly
// spread across the grid, rather than clumped in one corner or leaving
// whole rows/columns empty.
function spreadScore(paths: GridCell[][], rows: number, cols: number) {
  const rowCounts = new Array(rows).fill(0);
  const colCounts = new Array(cols).fill(0);
  for (const path of paths) {
    for (const [r, c] of path) {
      rowCounts[r]++;
      colCounts[c]++;
    }
  }
  const variance = (arr: number[]) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + (b - mean) ** 2, 0) / arr.length;
  };
  return variance(rowCounts) + variance(colCounts);
}

// How many extra ways the words can be spelled on this layout, beyond the
// planned paths. Words that share letters (1-/2-TIMOTHY, or a repeated
// syllable in Telugu) can often be traced along a second route; a player
// who takes it spells the word correctly but along cells the puzzle didn't
// plan, so layouts with no such alternatives are strongly preferred.
function ambiguity(paths: GridCell[][], wordLetters: string[][]) {
  const letterAt = new Map<string, string>();
  paths.forEach((path, i) => path.forEach(([r, c], j) => letterAt.set(key(r, c), wordLetters[i][j])));

  let extra = 0;
  for (const letters of wordLetters) {
    let count = 0;
    const extend = (r: number, c: number, i: number, seen: Set<string>) => {
      if (count > 1) return;
      if (i === letters.length - 1) {
        count++;
        return;
      }
      for (const [dr, dc] of DIRECTIONS) {
        const k = key(r + dr, c + dc);
        if (!seen.has(k) && letterAt.get(k) === letters[i + 1]) {
          seen.add(k);
          extend(r + dr, c + dc, i + 1, seen);
          seen.delete(k);
        }
      }
    };
    for (const [k, letter] of letterAt) {
      if (letter !== letters[0]) continue;
      const [r, c] = k.split(",").map(Number);
      extend(r, c, 0, new Set([k]));
    }
    extra += Math.max(0, count - 1);
  }
  return extra;
}

/**
 * Generates a random grid + word paths for a path/word-search puzzle:
 * every word becomes its own connected, non-overlapping path of cells
 * that bends in a random direction at each step, scattered across the
 * grid rather than clumped together. Cells outside every word's path
 * are filled with random letters — the puzzle UI never actually shows
 * them (they render as blocked tiles), so their content doesn't matter.
 *
 * Call this fresh each time the puzzle starts (or restarts) so the
 * layout is different every play, per the puzzle's own randomize flag.
 * Falls back to `fallback` (a known-good, pre-authored layout) in the
 * extremely unlikely case no attempt fits within the budget, so the
 * puzzle can never come up broken.
 */
export function generateWordSearchLayout(
  words: string[],
  rows: number,
  cols: number,
  fallback: { grid: string[][]; wordPaths: GridCell[][] },
  attempts = 300
): { grid: string[][]; wordPaths: GridCell[][] } {
  const wordLetters = words.map((word) => graphemes(word));
  const startsToTry = Math.min(rows * cols, 40);
  const walkBudget = 1000;

  let best: GridCell[][] | null = null;
  let bestAmbiguity = Infinity;
  let bestScore = Infinity;
  // Several full attempts (each is cheap), keeping the one where every word
  // can be spelled only one way, and among those the most evenly spread.
  // Stops early once an unambiguous layout has been compared against a few
  // others.
  let unambiguousSeen = 0;
  for (let i = 0; i < attempts; i++) {
    const layout = tryLayout(wordLetters, rows, cols, startsToTry, walkBudget);
    if (!layout) continue;
    const extra = ambiguity(layout, wordLetters);
    const score = spreadScore(layout, rows, cols);
    if (extra < bestAmbiguity || (extra === bestAmbiguity && score < bestScore)) {
      bestAmbiguity = extra;
      bestScore = score;
      best = layout;
    }
    if (extra === 0) unambiguousSeen++;
    if (unambiguousSeen >= 8) break;
  }

  if (!best) return fallback;

  const fillerPool = wordLetters.flat();
  const grid: string[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => fillerPool[Math.floor(Math.random() * fillerPool.length)])
  );
  words.forEach((_, i) => {
    best![i].forEach(([r, c], j) => {
      grid[r][c] = wordLetters[i][j];
    });
  });

  return { grid, wordPaths: best };
}
