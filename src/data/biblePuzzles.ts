export type OrderPuzzleData = {
  id: string;
  number: string;
  title: string;
  description: string;
  type: "order";
  items: string[];
};

export type MatchGroup = { label: string; items: string[] };

export type MatchPuzzleData = {
  id: string;
  number: string;
  title: string;
  description: string;
  type: "match";
  groups: MatchGroup[];
};

export type GridCell = [number, number];

export type PathPuzzleData = {
  id: string;
  number: string;
  title: string;
  description: string;
  type: "path";
  rows: number;
  cols: number;
  /** Full letter grid; null at blocked cells. */
  grid: (string | null)[][];
  blocked: GridCell[];
  /** The one true winding path, in order — its letters spell `words` joined. */
  path: GridCell[];
  words: string[];
};

export type BiblePuzzle = OrderPuzzleData | MatchPuzzleData | PathPuzzleData;

export const BIBLE_PUZZLES: BiblePuzzle[] = [
  {
    id: "1",
    number: "N01",
    title: "Books of the New Testament",
    description: "Drag each book into the top panel, in the correct order.",
    type: "order",
    items: [
      "Matthew",
      "Mark",
      "Luke",
      "John",
      "Acts",
      "Romans",
      "1 Corinthians",
      "2 Corinthians",
      "Galatians",
      "Ephesians",
      "Philippians",
      "Colossians",
      "1 Thessalonians",
      "2 Thessalonians",
      "1 Timothy",
      "2 Timothy",
      "Titus",
      "Philemon",
      "Hebrews",
      "James",
      "1 Peter",
      "2 Peter",
      "1 John",
      "2 John",
      "3 John",
      "Jude",
      "Revelation",
    ],
  },
  {
    id: "2",
    number: "N02",
    title: "Books of the Old Testament",
    description: "Drag each book into the top panel, in the correct order.",
    type: "order",
    items: [
      "Genesis",
      "Exodus",
      "Leviticus",
      "Numbers",
      "Deuteronomy",
      "Joshua",
      "Judges",
      "Ruth",
      "1 Samuel",
      "2 Samuel",
      "1 Kings",
      "2 Kings",
      "1 Chronicles",
      "2 Chronicles",
      "Ezra",
      "Nehemiah",
      "Esther",
      "Job",
      "Psalms",
      "Proverbs",
      "Ecclesiastes",
      "Song of Solomon",
      "Isaiah",
      "Jeremiah",
      "Lamentations",
      "Ezekiel",
      "Daniel",
      "Hosea",
      "Joel",
      "Amos",
      "Obadiah",
      "Jonah",
      "Micah",
      "Nahum",
      "Habakkuk",
      "Zephaniah",
      "Haggai",
      "Zechariah",
      "Malachi",
    ],
  },
  {
    id: "3",
    number: "N03",
    title: "Authors of the New Testament",
    description: "Drag each book down below into the author who wrote it.",
    type: "match",
    groups: [
      { label: "Matthew", items: ["Matthew"] },
      { label: "Mark", items: ["Mark"] },
      { label: "Luke", items: ["Luke", "Acts"] },
      {
        label: "John",
        items: ["John", "1 John", "2 John", "3 John", "Revelation"],
      },
      {
        label: "Paul",
        items: [
          "Romans",
          "1 Corinthians",
          "2 Corinthians",
          "Galatians",
          "Ephesians",
          "Philippians",
          "Colossians",
          "1 Thessalonians",
          "2 Thessalonians",
          "1 Timothy",
          "2 Timothy",
          "Titus",
          "Philemon",
        ],
      },
      { label: "James", items: ["James"] },
      { label: "Peter", items: ["1 Peter", "2 Peter"] },
      { label: "Jude", items: ["Jude"] },
      { label: "Unknown", items: ["Hebrews"] },
    ],
  },
  {
    id: "4",
    number: "N04",
    title: "Names of Jesus",
    description:
      "Trace one winding path through the grid — up, down, left, or right — to uncover four names of Jesus.",
    type: "path",
    rows: 8,
    cols: 8,
    words: ["SAVIOR", "MESSIAH", "KING OF KINGS", "PRINCE OF PEACE"],
    grid: [
      [null, "L", "D", null, "P", "F", "F", "O"],
      ["W", "J", "F", null, "E", "O", "K", "G"],
      ["E", "J", "D", "J", "A", "E", "I", "N"],
      ["O", null, "U", null, "C", "C", "N", "I"],
      ["Y", null, "O", null, "E", "N", "G", "K"],
      [null, "M", "L", "L", null, "I", "S", "H"],
      ["S", "I", "O", null, "D", "R", "P", "A"],
      ["A", "V", "R", "M", "E", "S", "S", "I"],
    ],
    blocked: [
      [1, 3], [4, 3], [4, 1], [5, 4], [0, 0],
      [5, 0], [6, 3], [3, 3], [0, 3], [3, 1],
    ],
    path: [
      [6, 0], [7, 0], [7, 1], [6, 1], [6, 2], [7, 2], [7, 3], [7, 4], [7, 5],
      [7, 6], [7, 7], [6, 7], [5, 7], [4, 7], [3, 7], [2, 7], [1, 7], [0, 7],
      [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [5, 6], [6, 6], [6, 5], [5, 5],
      [4, 5], [3, 5], [2, 5], [1, 5], [0, 5], [0, 4], [1, 4], [2, 4], [3, 4],
      [4, 4],
    ],
  },
];

export function getPuzzleById(id: string | undefined) {
  return BIBLE_PUZZLES.find((puzzle) => puzzle.id === id);
}
