// One-off generator: produces a grid + winding path + blocked cells for the
// "names of Jesus" path-tracing puzzle. Run once, paste the output into
// biblePuzzles.ts as static data — the puzzle is fixed, not regenerated
// per play, same as a real "daily puzzle" game.
const ROWS = 8;
const COLS = 8;
const WORDS = ["SAVIOR", "MESSIAH", "KINGOFKINGS", "PRINCEOFPEACE"];
const TARGET = WORDS.join("");
const BLOCKED_COUNT = 10;

function key(r, c) {
  return `${r},${c}`;
}

function neighbors(r, c) {
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1],
  ].filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Randomized self-avoiding walk with backtracking (warnsdorff-ish: prefer
// neighbors with fewer further options, to reduce dead-ends) until we reach
// the target length.
function findPath(targetLen, maxAttempts = 20000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const path = [];
    const visited = new Set();
    const startR = Math.floor(Math.random() * ROWS);
    const startC = Math.floor(Math.random() * COLS);
    path.push([startR, startC]);
    visited.add(key(startR, startC));

    let stuck = false;
    while (path.length < targetLen) {
      const [r, c] = path[path.length - 1];
      const options = shuffle(neighbors(r, c)).filter(
        ([nr, nc]) => !visited.has(key(nr, nc))
      );
      if (options.length === 0) {
        stuck = true;
        break;
      }
      // Warnsdorff heuristic: prefer the option with fewest onward moves,
      // to reduce the chance of painting ourselves into a corner.
      options.sort((a, b) => {
        const aOpts = neighbors(a[0], a[1]).filter((n) => !visited.has(key(n[0], n[1]))).length;
        const bOpts = neighbors(b[0], b[1]).filter((n) => !visited.has(key(n[0], n[1]))).length;
        return aOpts - bOpts === 0 ? Math.random() - 0.5 : aOpts - bOpts;
      });
      const next = options[0];
      path.push(next);
      visited.add(key(next[0], next[1]));
    }

    if (!stuck && path.length === targetLen) {
      return path;
    }
  }
  throw new Error("Failed to find a path after max attempts");
}

const path = findPath(TARGET.length);
const pathSet = new Set(path.map(([r, c]) => key(r, c)));

// Pick blocked cells from cells NOT on the path.
const allCells = [];
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (!pathSet.has(key(r, c))) allCells.push([r, c]);
  }
}
const blocked = shuffle(allCells).slice(0, BLOCKED_COUNT);
const blockedSet = new Set(blocked.map(([r, c]) => key(r, c)));

// Build the grid: path cells get their target letter, blocked cells are
// null, everything else gets a random decoy letter.
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));

path.forEach(([r, c], i) => {
  grid[r][c] = TARGET[i];
});
blocked.forEach(([r, c]) => {
  grid[r][c] = null;
});
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (grid[r][c] === null && !blockedSet.has(key(r, c))) {
      grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }
}

// Sanity checks.
const reconstructed = path.map(([r, c]) => grid[r][c]).join("");
if (reconstructed !== TARGET) throw new Error("Path letters don't match target!");
for (let i = 1; i < path.length; i++) {
  const [pr, pc] = path[i - 1];
  const [r, c] = path[i];
  const dist = Math.abs(pr - r) + Math.abs(pc - c);
  if (dist !== 1) throw new Error(`Non-adjacent step at index ${i}`);
}
const seen = new Set();
for (const [r, c] of path) {
  const k = key(r, c);
  if (seen.has(k)) throw new Error("Path revisits a cell!");
  seen.add(k);
}
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (grid[r][c] === null && !blockedSet.has(key(r, c))) {
      throw new Error(`Unfilled non-blocked cell at ${r},${c}`);
    }
  }
}

console.log("=== VALIDATION PASSED ===");
console.log("Path length:", path.length, "Target length:", TARGET.length);
console.log();
console.log("=== GRID (for visual check) ===");
for (let r = 0; r < ROWS; r++) {
  console.log(
    grid[r].map((ch, c) => (blockedSet.has(key(r, c)) ? "#" : ch)).join(" ")
  );
}
console.log();
console.log("=== TypeScript output ===");
console.log(`rows: ${ROWS},`);
console.log(`cols: ${COLS},`);
console.log(`words: ${JSON.stringify(WORDS)},`);
console.log(`grid: ${JSON.stringify(grid)},`);
console.log(`blocked: ${JSON.stringify(blocked)},`);
console.log(`path: ${JSON.stringify(path)},`);
