// One-off generator: places N independent, non-overlapping words on a grid
// (each its own straight/bent orthogonal path) for the drag-to-select
// word-find puzzles. Run once, paste the output into biblePuzzles.ts.
//
// Each word is anchored to start within its own assigned region of the
// grid (grid divided into roughly len(WORDS) regions) so the words end up
// spread across the whole board — a plain random walk per word tends to
// cluster them together by chance, leaving one lopsided empty area.
const ROWS = 10;
const COLS = 10;
const WORDS = [
  "EPHESUS",
  "SMYRNA",
  "PERGAMUM",
  "SARDIS",
  "PHILADELPHIA",
  "LAODICEA",
  "THYATIRA",
];

function key([r, c]) {
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

// Divide the grid into a regRows x regCols grid of regions, one per word
// (extra regions, if any, are simply unused).
const regCols = Math.ceil(Math.sqrt((WORDS.length * COLS) / ROWS));
const regRows = Math.ceil(WORDS.length / regCols);
const regions = [];
for (let rr = 0; rr < regRows; rr++) {
  for (let rc = 0; rc < regCols; rc++) {
    const rowStart = Math.floor((rr * ROWS) / regRows);
    const rowEnd = Math.floor(((rr + 1) * ROWS) / regRows);
    const colStart = Math.floor((rc * COLS) / regCols);
    const colEnd = Math.floor(((rc + 1) * COLS) / regCols);
    regions.push({ rowStart, rowEnd, colStart, colEnd });
  }
}

function findWordPath(word, usedSet, region, maxAttempts = 8000) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Prefer a start cell inside the word's home region; if that region is
    // full, fall back to anywhere free on the board.
    let candidates = [];
    for (let r = region.rowStart; r < region.rowEnd; r++) {
      for (let c = region.colStart; c < region.colEnd; c++) {
        if (!usedSet.has(key([r, c]))) candidates.push([r, c]);
      }
    }
    if (candidates.length === 0) {
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (!usedSet.has(key([r, c]))) candidates.push([r, c]);
        }
      }
    }
    if (candidates.length === 0) return null;

    const [sr, sc] = candidates[Math.floor(Math.random() * candidates.length)];
    const path = [[sr, sc]];
    const visited = new Set([key([sr, sc])]);
    let stuck = false;

    while (path.length < word.length) {
      const [r, c] = path[path.length - 1];
      const options = shuffle(neighbors(r, c)).filter(
        ([nr, nc]) => !visited.has(key([nr, nc])) && !usedSet.has(key([nr, nc]))
      );
      if (options.length === 0) {
        stuck = true;
        break;
      }
      const next = options[0];
      path.push(next);
      visited.add(key(next));
    }

    if (!stuck && path.length === word.length) return path;
  }
  return null;
}

// A spread-quality score: how many of the grid's own quadrants contain at
// least one path cell (higher is better; 4 is ideal for any grid size).
function spreadScore(wordPaths) {
  const quadrants = new Set();
  for (const path of wordPaths) {
    for (const [r, c] of path) {
      const qr = r < ROWS / 2 ? 0 : 1;
      const qc = c < COLS / 2 ? 0 : 1;
      quadrants.add(`${qr},${qc}`);
    }
  }
  return quadrants.size;
}

function generate() {
  const wordRegions = shuffle(regions).slice(0, WORDS.length);
  const usedSet = new Set();
  const wordPaths = [];
  for (let i = 0; i < WORDS.length; i++) {
    const path = findWordPath(WORDS[i], usedSet, wordRegions[i]);
    if (!path) return null;
    path.forEach((cell) => usedSet.add(key(cell)));
    wordPaths.push(path);
  }
  return wordPaths;
}

let best = null;
let bestScore = -1;
for (let i = 0; i < 300; i++) {
  const attempt = generate();
  if (!attempt) continue;
  const score = spreadScore(attempt);
  if (score > bestScore) {
    bestScore = score;
    best = attempt;
  }
  if (bestScore === 4) break; // all 4 quadrants covered — good enough
}
if (!best) throw new Error("Failed to place all words after 300 attempts");
const wordPaths = best;

// Build the grid.
const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
WORDS.forEach((word, i) => {
  wordPaths[i].forEach(([r, c], j) => {
    grid[r][c] = word[j];
  });
});
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
for (let r = 0; r < ROWS; r++) {
  for (let c = 0; c < COLS; c++) {
    if (grid[r][c] === null) {
      grid[r][c] = ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
    }
  }
}

// Validate.
WORDS.forEach((word, i) => {
  const reconstructed = wordPaths[i].map(([r, c]) => grid[r][c]).join("");
  if (reconstructed !== word) throw new Error(`Mismatch for ${word}: got ${reconstructed}`);
  for (let k = 1; k < wordPaths[i].length; k++) {
    const [pr, pc] = wordPaths[i][k - 1];
    const [r, c] = wordPaths[i][k];
    if (Math.abs(pr - r) + Math.abs(pc - c) !== 1) {
      throw new Error(`Non-adjacent step in ${word} at index ${k}`);
    }
  }
});
const allUsed = new Set();
wordPaths.forEach((wp, i) => {
  wp.forEach((cell) => {
    const k = key(cell);
    if (allUsed.has(k)) throw new Error(`Overlap detected involving word ${WORDS[i]}`);
    allUsed.add(k);
  });
});

console.log("=== VALIDATION PASSED ===");
console.log("Spread score (quadrants covered, out of 4):", bestScore);
console.log();
console.log("=== GRID (for visual check) ===");
for (let r = 0; r < ROWS; r++) {
  console.log(grid[r].join(" "));
}
console.log();
console.log("=== TypeScript output ===");
console.log(`rows: ${ROWS},`);
console.log(`cols: ${COLS},`);
console.log(`words: ${JSON.stringify(WORDS)},`);
console.log(`grid: ${JSON.stringify(grid)},`);
console.log(`wordPaths: ${JSON.stringify(wordPaths)},`);
