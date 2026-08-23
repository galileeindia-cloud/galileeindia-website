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
  grid: string[][];
  words: string[];
  /** One independent orthogonal path per word, in the same order as `words`;
   * each word's letters read off its own path in order. Paths don't overlap. */
  wordPaths: GridCell[][];
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
      { label: "James", items: ["James"] },
      { label: "Peter", items: ["1 Peter", "2 Peter"] },
      { label: "Jude", items: ["Jude"] },
      { label: "Unknown", items: ["Hebrews"] },
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
    ],
  },
  {
    id: "4",
    number: "N04",
    title: "Names of Jesus",
    description:
      "Drag across connected letters — up, down, left, or right — to find seven names of Jesus.",
    type: "path",
    rows: 8,
    cols: 8,
    words: ["SAVIOR", "CHRIST", "MESSIAH", "ROCK", "IMMANUEL", "REDEEMER", "LIFE"],
    grid: [
      ["I", "A", "N", "U", "E", "L", "Z", "A"],
      ["M", "M", "K", "A", "S", "R", "E", "T"],
      ["K", "K", "H", "Y", "E", "M", "D", "P"],
      ["W", "C", "U", "E", "R", "E", "E", "P"],
      ["R", "O", "H", "C", "F", "J", "S", "A"],
      ["E", "F", "R", "I", "E", "S", "S", "V"],
      ["L", "I", "N", "S", "M", "A", "I", "I"],
      ["P", "O", "V", "T", "L", "H", "R", "O"],
    ],
    wordPaths: [
      [[4, 6], [4, 7], [5, 7], [6, 7], [7, 7], [7, 6]],
      [[4, 3], [4, 2], [5, 2], [5, 3], [6, 3], [7, 3]],
      [[6, 4], [5, 4], [5, 5], [5, 6], [6, 6], [6, 5], [7, 5]],
      [[4, 0], [4, 1], [3, 1], [2, 1]],
      [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5]],
      [[1, 5], [1, 6], [2, 6], [3, 6], [3, 5], [2, 5], [2, 4], [3, 4]],
      [[6, 0], [6, 1], [5, 1], [5, 0]],
    ],
  },
  {
    id: "5",
    number: "N05",
    title: "Disciples of Jesus",
    description:
      "Drag across connected letters — up, down, left, or right — to find seven of the twelve disciples.",
    type: "path",
    rows: 7,
    cols: 7,
    words: ["PETER", "MATTHEW", "JAMES", "JOHN", "THOMAS", "PHILIP", "JUDAS"],
    grid: [
      ["Y", "J", "V", "K", "M", "M", "P"],
      ["M", "A", "H", "T", "Q", "M", "H"],
      ["E", "S", "O", "M", "A", "P", "I"],
      ["P", "L", "U", "D", "S", "I", "L"],
      ["E", "R", "J", "A", "S", "N", "G"],
      ["T", "E", "N", "A", "M", "K", "W"],
      ["J", "O", "H", "T", "T", "H", "E"],
    ],
    wordPaths: [
      [[3, 0], [4, 0], [5, 0], [5, 1], [4, 1]],
      [[5, 4], [5, 3], [6, 3], [6, 4], [6, 5], [6, 6], [5, 6]],
      [[0, 1], [1, 1], [1, 0], [2, 0], [2, 1]],
      [[6, 0], [6, 1], [6, 2], [5, 2]],
      [[1, 3], [1, 2], [2, 2], [2, 3], [2, 4], [3, 4]],
      [[0, 6], [1, 6], [2, 6], [3, 6], [3, 5], [2, 5]],
      [[4, 2], [3, 2], [3, 3], [4, 3], [4, 4]],
    ],
  },
  {
    id: "6",
    number: "N06",
    title: "Equipped for Service",
    description:
      "Jesus gave us the following to equip His people for works of service. Drag across connected letters to find them all.",
    type: "path",
    rows: 8,
    cols: 8,
    words: ["APOSTLES", "PROPHETS", "EVANGELISTS", "PASTORS", "TEACHERS"],
    grid: [
      ["J", "E", "H", "C", "A", "E", "T", "E"],
      ["Z", "R", "A", "O", "S", "E", "S", "S"],
      ["A", "S", "Q", "P", "T", "L", "K", "T"],
      ["H", "P", "S", "A", "K", "S", "S", "S"],
      ["T", "F", "Y", "R", "P", "E", "T", "I"],
      ["S", "T", "O", "O", "P", "H", "G", "L"],
      ["A", "P", "R", "K", "A", "N", "G", "E"],
      ["P", "T", "S", "Y", "V", "E", "L", "I"],
    ],
    wordPaths: [
      [[3, 3], [2, 3], [1, 3], [1, 4], [2, 4], [2, 5], [1, 5], [1, 6]],
      [[4, 4], [4, 3], [5, 3], [5, 4], [5, 5], [4, 5], [4, 6], [3, 6]],
      [[7, 5], [7, 4], [6, 4], [6, 5], [6, 6], [6, 7], [5, 7], [4, 7], [3, 7], [2, 7], [1, 7]],
      [[7, 0], [6, 0], [5, 0], [5, 1], [5, 2], [6, 2], [7, 2]],
      [[0, 6], [0, 5], [0, 4], [0, 3], [0, 2], [0, 1], [1, 1], [2, 1]],
    ],
  },
];

export function getPuzzleById(id: string | undefined) {
  return BIBLE_PUZZLES.find((puzzle) => puzzle.id === id);
}
