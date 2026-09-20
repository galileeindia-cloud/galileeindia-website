// One-off generator: interlocks a word list into a crossword grid, numbers
// the clues, and prints the `entries` block to paste into biblePuzzles.ts.
// Run: node scripts/generate-crossword.js

const CLUES = {
  AMITTAI: "Jonah's father",
  NINEVEH: "The great city God sent Jonah to warn",
  SAILORS: "Frightened men on the ship who cried out to their gods and threw Jonah overboard",
  GOD: "Jonah said he worshiped the LORD, the ___ of heaven, who made the sea and the land",
  TARSHISH: "The place Jonah sailed toward to run away from the LORD",
  JOPPA: "The port city where Jonah found a ship",
  SEA: "It grew calm as soon as Jonah was thrown into it",
  FISH: "The great ___ the LORD appointed to swallow Jonah",
  WIND: "The LORD hurled a great ___ upon the sea, and a mighty storm arose",
  PLANT: "The LORD appointed a ___ to grow over Jonah and shade his head",
};
const WORDS = Object.keys(CLUES);

const key = (r, c) => `${r},${c}`;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function tryBuild(order) {
  const cells = new Map(); // key -> letter
  const dirsAt = new Map(); // key -> Set of directions already using the cell
  const placed = [];
  let bounds = null;

  function score(word, r, c, dir) {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    if (cells.has(key(r - dr, c - dc))) return -1;
    if (cells.has(key(r + dr * word.length, c + dc * word.length))) return -1;
    let crossings = 0;
    for (let i = 0; i < word.length; i++) {
      const rr = r + dr * i;
      const cc = c + dc * i;
      const existing = cells.get(key(rr, cc));
      if (existing) {
        if (existing !== word[i]) return -1;
        if (dirsAt.get(key(rr, cc)).has(dir)) return -1;
        crossings++;
      } else if (dir === "across") {
        if (cells.has(key(rr - 1, cc)) || cells.has(key(rr + 1, cc))) return -1;
      } else if (cells.has(key(rr, cc - 1)) || cells.has(key(rr, cc + 1))) {
        return -1;
      }
    }
    return crossings;
  }

  function commit(word, r, c, dir) {
    const dr = dir === "down" ? 1 : 0;
    const dc = dir === "across" ? 1 : 0;
    for (let i = 0; i < word.length; i++) {
      const k = key(r + dr * i, c + dc * i);
      cells.set(k, word[i]);
      if (!dirsAt.has(k)) dirsAt.set(k, new Set());
      dirsAt.get(k).add(dir);
    }
    placed.push({ answer: word, row: r, col: c, direction: dir });
    const endR = r + dr * (word.length - 1);
    const endC = c + dc * (word.length - 1);
    bounds = bounds
      ? {
          minR: Math.min(bounds.minR, r),
          maxR: Math.max(bounds.maxR, endR),
          minC: Math.min(bounds.minC, c),
          maxC: Math.max(bounds.maxC, endC),
        }
      : { minR: r, maxR: endR, minC: c, maxC: endC };
  }

  commit(order[0], 0, 0, "across");

  for (const word of order.slice(1)) {
    let best = null;
    for (let r = bounds.minR - word.length; r <= bounds.maxR + word.length; r++) {
      for (let c = bounds.minC - word.length; c <= bounds.maxC + word.length; c++) {
        for (const dir of ["across", "down"]) {
          const crossings = score(word, r, c, dir);
          if (crossings < 1) continue;
          const dr = dir === "down" ? 1 : 0;
          const dc = dir === "across" ? 1 : 0;
          const h =
            Math.max(bounds.maxR, r + dr * (word.length - 1)) -
            Math.min(bounds.minR, r) +
            1;
          const w =
            Math.max(bounds.maxC, c + dc * (word.length - 1)) -
            Math.min(bounds.minC, c) +
            1;
          const cost = Math.max(h, w) * 100 + h * w - crossings * 5 + Math.random();
          if (!best || cost < best.cost) best = { r, c, dir, cost };
        }
      }
    }
    if (!best) return null;
    commit(word, best.r, best.c, best.dir);
  }

  return { placed, cells, bounds };
}

let best = null;
for (let i = 0; i < 3000; i++) {
  const [first, ...rest] = [...WORDS].sort((a, b) => b.length - a.length);
  const order = [first, ...shuffle(rest)];
  const built = tryBuild(order);
  if (!built) continue;
  const h = built.bounds.maxR - built.bounds.minR + 1;
  const w = built.bounds.maxC - built.bounds.minC + 1;
  const cost = Math.max(h, w) * 1000 + h * w;
  if (!best || cost < best.cost) best = { ...built, cost, h, w };
}
if (!best) throw new Error("Could not interlock all words");

// Normalise to a 0-based grid.
const { minR, minC } = best.bounds;
const rows = best.h;
const cols = best.w;
const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
for (const [k, letter] of best.cells) {
  const [r, c] = k.split(",").map(Number);
  grid[r - minR][c - minC] = letter;
}
const entries = best.placed.map((e) => ({
  ...e,
  row: e.row - minR,
  col: e.col - minC,
}));

// Number the clues the way a printed crossword does.
const at = (r, c) => (r >= 0 && r < rows && c >= 0 && c < cols ? grid[r][c] : null);
let n = 0;
const numberAt = new Map();
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (!grid[r][c]) continue;
    const startsAcross = !at(r, c - 1) && at(r, c + 1);
    const startsDown = !at(r - 1, c) && at(r + 1, c);
    if (startsAcross || startsDown) numberAt.set(key(r, c), ++n);
  }
}
for (const e of entries) e.clueNumber = numberAt.get(key(e.row, e.col));

// Validate: every run of 2+ letters must be exactly one placed entry.
let runs = 0;
for (let r = 0; r < rows; r++) {
  for (let c = 0; c < cols; c++) {
    if (!grid[r][c]) continue;
    if (!at(r, c - 1) && at(r, c + 1)) runs++;
    if (!at(r - 1, c) && at(r + 1, c)) runs++;
  }
}
if (runs !== entries.length) {
  throw new Error(`Unintended words: ${runs} runs vs ${entries.length} entries`);
}
for (const e of entries) {
  const dr = e.direction === "down" ? 1 : 0;
  const dc = e.direction === "across" ? 1 : 0;
  const read = [...e.answer].map((_, i) => grid[e.row + dr * i][e.col + dc * i]).join("");
  if (read !== e.answer) throw new Error(`Mismatch for ${e.answer}`);
}

entries.sort(
  (a, b) => a.clueNumber - b.clueNumber || (a.direction === "across" ? -1 : 1)
);

console.log("=== VALIDATION PASSED ===");
console.log(`Grid ${rows} x ${cols}`);
for (const row of grid) console.log(row.map((x) => x || ".").join(" "));
console.log();
console.log("=== TypeScript output ===");
console.log(`rows: ${rows},`);
console.log(`cols: ${cols},`);
console.log("entries: [");
for (const e of entries) {
  console.log(
    `  { clueNumber: ${e.clueNumber}, direction: "${e.direction}", row: ${e.row}, col: ${e.col}, answer: ${JSON.stringify(e.answer)}, clue: ${JSON.stringify(CLUES[e.answer])} },`
  );
}
console.log("],");
