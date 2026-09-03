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

export type BibleVerse = { text: string; reference: string };

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
  /** Optional verses shown above the puzzle, giving the words context. */
  verses?: BibleVerse[];
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
  {
    id: "7",
    number: "N07",
    title: "The Fruit of the Spirit",
    description:
      "The fruit of the Spirit is ________. Hint: Refer to Galatians 5:22-23. Drag across connected letters to find them all.",
    type: "path",
    rows: 11,
    cols: 11,
    words: [
      "LOVE",
      "JOY",
      "PEACE",
      "PATIENCE",
      "KINDNESS",
      "GOODNESS",
      "FAITHFULNESS",
      "GENTLENESS",
      "SELFCONTROL",
    ],
    grid: [
      ["E", "P", "C", "K", "E", "N", "L", "N", "S", "L", "F"],
      ["A", "C", "O", "J", "H", "F", "U", "E", "S", "E", "C"],
      ["X", "E", "Y", "N", "T", "I", "S", "L", "U", "S", "O"],
      ["J", "O", "G", "S", "E", "A", "F", "F", "L", "O", "N"],
      ["H", "O", "E", "S", "C", "E", "E", "G", "T", "R", "T"],
      ["Z", "D", "N", "A", "N", "S", "N", "S", "I", "E", "X"],
      ["Z", "S", "X", "J", "E", "S", "T", "B", "D", "L", "C"],
      ["E", "S", "K", "D", "I", "E", "L", "J", "N", "I", "X"],
      ["N", "D", "S", "V", "T", "N", "E", "H", "X", "E", "V"],
      ["Z", "N", "S", "N", "A", "P", "A", "N", "H", "E", "O"],
      ["K", "I", "R", "A", "J", "U", "K", "T", "F", "W", "L"],
    ],
    wordPaths: [
      [[10, 10], [9, 10], [8, 10], [8, 9]],
      [[1, 3], [1, 2], [2, 2]],
      [[0, 1], [0, 0], [1, 0], [1, 1], [2, 1]],
      [[9, 5], [9, 4], [8, 4], [7, 4], [6, 4], [5, 4], [4, 4], [3, 4]],
      [[10, 0], [10, 1], [9, 1], [8, 1], [8, 0], [7, 0], [7, 1], [6, 1]],
      [[3, 2], [3, 1], [4, 1], [5, 1], [5, 2], [4, 2], [4, 3], [3, 3]],
      [[3, 6], [3, 5], [2, 5], [2, 4], [1, 4], [1, 5], [1, 6], [0, 6], [0, 7], [1, 7], [1, 8], [0, 8]],
      [[4, 7], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [8, 5], [7, 5], [6, 5], [5, 5]],
      [[2, 9], [1, 9], [0, 9], [0, 10], [1, 10], [2, 10], [3, 10], [4, 10], [4, 9], [3, 9], [3, 8]],
    ],
  },
  {
    id: "8",
    number: "N08",
    title: "Devoted to These Four Things",
    description:
      "The early church devoted themselves to the following. Hint: Refer to Acts 2:42. Drag across connected letters to find them all.",
    type: "path",
    rows: 9,
    cols: 9,
    words: ["APOSTLES-TEACHING", "FELLOWSHIP", "BREAKING-OF-BREAD", "PRAYER"],
    grid: [
      ["M", "P", "A", "E", "R", "B", "-", "F", "Q"],
      ["I", "O", "S", "A", "O", "A", "K", "O", "-"],
      ["Q", "I", "T", "D", "D", "X", "I", "W", "G"],
      ["S", "E", "L", "T", "B", "R", "F", "I", "N"],
      ["-", "Q", "V", "H", "D", "E", "A", "K", "G"],
      ["T", "P", "C", "Z", "K", "S", "R", "E", "R"],
      ["E", "A", "C", "F", "E", "C", "A", "Y", "F"],
      ["O", "G", "H", "L", "L", "C", "R", "P", "L"],
      ["O", "N", "I", "O", "W", "S", "H", "I", "P"],
    ],
    wordPaths: [
      [[0, 2], [0, 1], [1, 1], [1, 2], [2, 2], [3, 2], [3, 1], [3, 0], [4, 0], [5, 0], [6, 0], [6, 1], [6, 2], [7, 2], [8, 2], [8, 1], [7, 1]],
      [[6, 3], [6, 4], [7, 4], [7, 3], [8, 3], [8, 4], [8, 5], [8, 6], [8, 7], [8, 8]],
      [[3, 4], [3, 5], [4, 5], [4, 6], [4, 7], [3, 7], [3, 8], [2, 8], [1, 8], [1, 7], [0, 7], [0, 6], [0, 5], [0, 4], [0, 3], [1, 3], [2, 3]],
      [[7, 7], [7, 6], [6, 6], [6, 7], [5, 7], [5, 6]],
    ],
  },
  {
    id: "9",
    number: "N09",
    title: "Persons in the Life of Abraham",
    description:
      "Unjumble all the persons in the life of Abraham. Drag across connected letters to find them all.",
    type: "path",
    rows: 6,
    cols: 6,
    words: ["ISAAC", "LOT", "HAGAR", "SARAH", "ISHMAEL"],
    grid: [
      ["H", "N", "T", "A", "S", "C"],
      ["Y", "L", "O", "R", "R", "Y"],
      ["R", "S", "I", "A", "D", "W"],
      ["A", "H", "M", "H", "O", "K"],
      ["G", "A", "A", "I", "S", "A"],
      ["E", "H", "E", "L", "C", "A"],
    ],
    wordPaths: [
      [[4, 3], [4, 4], [4, 5], [5, 5], [5, 4]],
      [[1, 1], [1, 2], [0, 2]],
      [[5, 1], [4, 1], [4, 0], [3, 0], [2, 0]],
      [[0, 4], [0, 3], [1, 3], [2, 3], [3, 3]],
      [[2, 2], [2, 1], [3, 1], [3, 2], [4, 2], [5, 2], [5, 3]],
    ],
  },
  {
    id: "10",
    number: "N10",
    title: "Jesus's Closest Disciples",
    description:
      "Name the three disciples who were closest to Jesus. Drag across connected letters to find them all.",
    type: "path",
    rows: 5,
    cols: 5,
    words: ["PETER", "JAMES", "JOHN"],
    grid: [
      ["Z", "P", "P", "S", "D"],
      ["P", "G", "U", "E", "M"],
      ["E", "T", "I", "J", "A"],
      ["I", "E", "R", "M", "K"],
      ["J", "O", "H", "N", "Z"],
    ],
    wordPaths: [
      [[1, 0], [2, 0], [2, 1], [3, 1], [3, 2]],
      [[2, 3], [2, 4], [1, 4], [1, 3], [0, 3]],
      [[4, 0], [4, 1], [4, 2], [4, 3]],
    ],
  },
  {
    id: "11",
    number: "N11",
    title: "The Seven Churches Referred to as Seven Lampstands in the Book of Revelation",
    description:
      "Figure out the names of the seven churches recorded in the 2nd and 3rd chapters of Revelation, referred to as the seven lampstands. Drag across connected letters to find them all.",
    type: "path",
    rows: 10,
    cols: 10,
    words: [
      "EPHESUS",
      "SMYRNA",
      "PERGAMUM",
      "SARDIS",
      "PHILADELPHIA",
      "LAODICEA",
      "THYATIRA",
    ],
    grid: [
      ["S", "W", "V", "S", "D", "A", "M", "U", "M", "Y"],
      ["O", "Y", "L", "Z", "P", "G", "T", "H", "Y", "A"],
      ["S", "O", "S", "A", "E", "R", "W", "P", "I", "T"],
      ["Q", "I", "D", "R", "V", "S", "I", "M", "R", "A"],
      ["V", "S", "C", "X", "S", "U", "U", "B", "G", "K"],
      ["P", "D", "E", "L", "E", "H", "A", "X", "E", "C"],
      ["H", "A", "P", "P", "H", "P", "Q", "A", "V", "C"],
      ["I", "L", "N", "A", "I", "E", "N", "A", "N", "L"],
      ["A", "E", "C", "I", "N", "Y", "R", "C", "J", "D"],
      ["L", "A", "O", "D", "S", "M", "S", "X", "I", "B"],
    ],
    wordPaths: [
      [[7, 5], [6, 5], [5, 5], [5, 4], [4, 4], [4, 5], [3, 5]],
      [[9, 6], [9, 5], [8, 5], [8, 6], [7, 6], [7, 7]],
      [[1, 4], [2, 4], [2, 5], [1, 5], [0, 5], [0, 6], [0, 7], [0, 8]],
      [[2, 2], [2, 3], [3, 3], [3, 2], [3, 1], [4, 1]],
      [[5, 0], [6, 0], [7, 0], [7, 1], [6, 1], [5, 1], [5, 2], [5, 3], [6, 3], [6, 4], [7, 4], [7, 3]],
      [[9, 0], [9, 1], [9, 2], [9, 3], [8, 3], [8, 2], [8, 1], [8, 0]],
      [[1, 6], [1, 7], [1, 8], [1, 9], [2, 9], [2, 8], [3, 8], [3, 9]],
    ],
  },
  {
    id: "12",
    number: "N12",
    title: "Words from Popular Bible Verses",
    description:
      "Find the CAPITALIZED words from these popular Bible verses. Drag across connected letters to find them all.",
    type: "path",
    rows: 12,
    cols: 12,
    words: [
      "SHEPHERD",
      "WORD",
      "GOD",
      "WORLD",
      "SON",
      "CHRIST",
      "SALVATION",
      "LIGHT",
      "HEART",
      "UNDERSTANDING",
      "DIRECT",
      "LORD",
      "WISDOM",
    ],
    grid: [
      ["L", "Z", "I", "R", "N", "O", "R", "J", "Q", "G", "I", "L"],
      ["E", "R", "D", "Q", "L", "W", "L", "I", "S", "H", "T", "A"],
      ["H", "H", "S", "R", "E", "I", "D", "F", "O", "N", "S", "Y"],
      ["P", "E", "L", "V", "O", "L", "P", "E", "R", "A", "T", "G"],
      ["J", "D", "T", "D", "R", "J", "M", "O", "T", "E", "H", "N"],
      ["A", "J", "S", "T", "N", "Z", "W", "D", "S", "T", "A", "I"],
      ["Z", "E", "A", "N", "O", "Y", "I", "S", "R", "P", "N", "D"],
      ["M", "E", "L", "T", "I", "J", "N", "D", "E", "G", "F", "V"],
      ["M", "I", "V", "A", "G", "J", "U", "G", "M", "F", "X", "Z"],
      ["N", "L", "N", "I", "R", "T", "S", "H", "R", "E", "O", "K"],
      ["B", "K", "W", "D", "E", "C", "U", "C", "I", "J", "D", "R"],
      ["S", "L", "O", "R", "D", "W", "O", "T", "S", "G", "O", "W"],
    ],
    wordPaths: [
      [[2, 2], [2, 1], [3, 1], [3, 0], [2, 0], [1, 0], [1, 1], [1, 2]],
      [[10, 2], [11, 2], [11, 3], [11, 4]],
      [[11, 9], [11, 10], [10, 10]],
      [[1, 5], [0, 5], [0, 6], [1, 6], [2, 6]],
      [[1, 8], [2, 8], [2, 9]],
      [[10, 7], [9, 7], [9, 8], [10, 8], [11, 8], [11, 7]],
      [[5, 2], [6, 2], [7, 2], [8, 2], [8, 3], [7, 3], [7, 4], [6, 4], [5, 4]],
      [[0, 11], [0, 10], [0, 9], [1, 9], [1, 10]],
      [[4, 10], [4, 9], [3, 9], [3, 8], [4, 8]],
      [[8, 6], [7, 6], [7, 7], [7, 8], [6, 8], [5, 8], [5, 9], [5, 10], [6, 10], [6, 11], [5, 11], [4, 11], [3, 11]],
      [[10, 3], [9, 3], [9, 4], [10, 4], [10, 5], [9, 5]],
      [[3, 5], [3, 4], [4, 4], [4, 3]],
      [[5, 6], [6, 6], [6, 7], [5, 7], [4, 7], [4, 6]],
    ],
    verses: [
      { text: "The LORD is my SHEPHERD; I shall not want.", reference: "Psalm 23:1" },
      {
        text: "In the beginning was the WORD, and the WORD was with GOD, and the WORD was GOD.",
        reference: "John 1:1",
      },
      {
        text: "For God so loved the WORLD that He gave His only begotten SON.",
        reference: "John 3:16",
      },
      {
        text: "I can do all things through CHRIST who strengthens me.",
        reference: "Philippians 4:13",
      },
      {
        text: "The LORD is my LIGHT and my SALVATION — whom shall I fear?",
        reference: "Psalm 27:1",
      },
      {
        text: "Trust in the LORD with all your HEART, and lean not on your own UNDERSTANDING.",
        reference: "Proverbs 3:5",
      },
      {
        text: "In all your ways acknowledge Him, and He shall DIRECT your paths.",
        reference: "Proverbs 3:6",
      },
      {
        text: "The fear of the LORD is the beginning of WISDOM.",
        reference: "Proverbs 9:10",
      },
    ],
  },
];

export function getPuzzleById(id: string | undefined) {
  return BIBLE_PUZZLES.find((puzzle) => puzzle.id === id);
}
