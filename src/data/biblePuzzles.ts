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

export type QuizQuestion = {
  question: string;
  options: string[];
  /** Index into `options` (as authored) of the correct answer. */
  correctIndex: number;
};

export type QuizPuzzleData = {
  id: string;
  number: string;
  title: string;
  description: string;
  type: "quiz";
  questions: QuizQuestion[];
};

export type FillSentence = {
  /** Sentence text where each "___" marks a blank, filled in order by `answers`. */
  text: string;
  answers: string[];
};

export type FillPuzzleData = {
  id: string;
  number: string;
  title: string;
  description: string;
  type: "fill";
  sentences: FillSentence[];
};

export type BiblePuzzle =
  | OrderPuzzleData
  | MatchPuzzleData
  | PathPuzzleData
  | QuizPuzzleData
  | FillPuzzleData;

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
  {
    id: "13",
    number: "N13",
    title: "Unjumble the Woman's Names Found in the Bible",
    description:
      "Unjumble the woman's names found in the Bible. Drag across connected letters to find them all.",
    type: "path",
    rows: 9,
    cols: 9,
    words: ["MARY", "RUTH", "ESTHER", "SARAH", "REBEKAH", "RACHEL", "MIRIAM", "DEBORAH"],
    grid: [
      ["G", "K", "A", "I", "R", "D", "A", "L", "J"],
      ["Y", "B", "M", "K", "I", "M", "Z", "I", "P"],
      ["E", "H", "E", "R", "O", "B", "F", "B", "I"],
      ["S", "T", "Y", "A", "R", "E", "D", "A", "O"],
      ["F", "A", "R", "H", "R", "D", "L", "E", "V"],
      ["B", "M", "R", "M", "U", "Y", "C", "H", "V"],
      ["L", "G", "D", "H", "T", "R", "A", "R", "E"],
      ["V", "H", "A", "A", "H", "E", "N", "R", "X"],
      ["S", "A", "R", "K", "E", "B", "X", "Q", "J"],
    ],
    wordPaths: [
      [[5, 1], [4, 1], [4, 2], [3, 2]],
      [[4, 4], [5, 4], [6, 4], [6, 3]],
      [[2, 0], [3, 0], [3, 1], [2, 1], [2, 2], [2, 3]],
      [[8, 0], [8, 1], [8, 2], [7, 2], [7, 1]],
      [[6, 5], [7, 5], [8, 5], [8, 4], [8, 3], [7, 3], [7, 4]],
      [[6, 7], [6, 6], [5, 6], [5, 7], [4, 7], [4, 6]],
      [[1, 5], [1, 4], [0, 4], [0, 3], [0, 2], [1, 2]],
      [[3, 6], [3, 5], [2, 5], [2, 4], [3, 4], [3, 3], [4, 3]],
    ],
  },
  {
    id: "14",
    number: "N14",
    title: "Bible Trivia Quiz",
    description:
      "Test your Bible knowledge! Answer all 14 multiple-choice questions.",
    type: "quiz",
    questions: [
      {
        question: "How many books are there in the Old Testament?",
        options: ["27", "39", "46", "66"],
        correctIndex: 1,
      },
      {
        question: "How many books are there in the New Testament?",
        options: ["23", "27", "39", "66"],
        correctIndex: 1,
      },
      {
        question: "How many books are there in the entire Bible?",
        options: ["39", "27", "66", "73"],
        correctIndex: 2,
      },
      {
        question: "Which is the longest book in the Bible?",
        options: ["Isaiah", "Genesis", "Psalms", "Jeremiah"],
        correctIndex: 2,
      },
      {
        question: "Which is the shortest book in the Bible?",
        options: ["Obadiah", "Jude", "2 John", "3 John"],
        correctIndex: 2,
      },
      {
        question: "Which is the longest chapter in the Bible?",
        options: ["Psalm 118", "Psalm 119", "Genesis 1", "Numbers 7"],
        correctIndex: 1,
      },
      {
        question: "Which is the shortest chapter in the Bible?",
        options: ["Psalm 1", "Psalm 23", "Psalm 117", "Psalm 150"],
        correctIndex: 2,
      },
      {
        question: "Which is the shortest verse in the Bible?",
        options: ["John 3:16", "1 Thessalonians 5:16", "Job 3:2", "John 11:35"],
        correctIndex: 3,
      },
      {
        question: "Which book has the most chapters in the Bible?",
        options: ["Isaiah", "Psalms", "Jeremiah", "Genesis"],
        correctIndex: 1,
      },
      {
        question: "What is the first book of the Bible?",
        options: ["Exodus", "Job", "Genesis", "Matthew"],
        correctIndex: 2,
      },
      {
        question: "What is the last book of the Bible?",
        options: ["Malachi", "Acts", "Jude", "Revelation"],
        correctIndex: 3,
      },
      {
        question: "What is the first book of the New Testament?",
        options: ["Mark", "Matthew", "John", "Acts"],
        correctIndex: 1,
      },
      {
        question: "What is the last book of the Old Testament?",
        options: ["Zechariah", "Nehemiah", "Malachi", "Haggai"],
        correctIndex: 2,
      },
      {
        question: "Which Gospel is the shortest?",
        options: ["Matthew", "Mark", "Luke", "John"],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "15",
    number: "N15",
    title: "Unjumble the First 5 Books of the Bible",
    description:
      "These five books are also called the Pentateuch. Their author is Moses. Drag across connected letters to find them all.",
    type: "path",
    rows: 8,
    cols: 8,
    words: ["GENESIS", "EXODUS", "LEVITICUS", "NUMBERS", "DEUTERONOMY"],
    grid: [
      ["U", "F", "N", "S", "T", "Y", "M", "D"],
      ["L", "E", "S", "I", "S", "P", "O", "E"],
      ["U", "N", "E", "G", "U", "A", "N", "U"],
      ["I", "T", "I", "V", "Q", "A", "O", "T"],
      ["C", "U", "L", "E", "X", "E", "R", "E"],
      ["O", "S", "B", "J", "O", "E", "O", "J"],
      ["Q", "Q", "S", "U", "D", "D", "F", "D"],
      ["L", "N", "U", "M", "B", "E", "R", "S"],
    ],
    wordPaths: [
      [[2, 3], [2, 2], [2, 1], [1, 1], [1, 2], [1, 3], [0, 3]],
      [[4, 5], [4, 4], [5, 4], [6, 4], [6, 3], [6, 2]],
      [[4, 2], [4, 3], [3, 3], [3, 2], [3, 1], [3, 0], [4, 0], [4, 1], [5, 1]],
      [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7]],
      [[0, 7], [1, 7], [2, 7], [3, 7], [4, 7], [4, 6], [3, 6], [2, 6], [1, 6], [0, 6], [0, 5]],
    ],
  },
  {
    id: "16",
    number: "N16",
    title: "Unjumble the Major Prophets",
    description:
      "Unjumble the names of the major prophets in the Bible. Drag across connected letters to find them all.",
    type: "path",
    rows: 6,
    cols: 6,
    words: ["ISAIAH", "JEREMIAH", "EZEKIEL", "DANIEL"],
    grid: [
      ["M", "I", "S", "A", "E", "L"],
      ["O", "Y", "A", "I", "I", "D"],
      ["E", "L", "H", "H", "N", "A"],
      ["I", "U", "Z", "A", "I", "V"],
      ["K", "E", "O", "Q", "M", "E"],
      ["E", "Z", "S", "J", "E", "R"],
    ],
    wordPaths: [
      [[0, 1], [0, 2], [0, 3], [1, 3], [1, 2], [2, 2]],
      [[5, 3], [5, 4], [5, 5], [4, 5], [4, 4], [3, 4], [3, 3], [2, 3]],
      [[4, 1], [5, 1], [5, 0], [4, 0], [3, 0], [2, 0], [2, 1]],
      [[1, 5], [2, 5], [2, 4], [1, 4], [0, 4], [0, 5]],
    ],
  },
  {
    id: "17",
    number: "N17",
    title: "యేసుకు అత్యంత సన్నిహితంగా ఉన్న శిష్యుల పేర్లు చెప్పండి.",
    description:
      "పరస్పరం ఆనుకుని ఉన్న అక్షరాలను లాగి, శిష్యుల పేర్లను కనుగొనండి.",
    type: "path",
    rows: 5,
    cols: 5,
    words: ["పేతురు", "యాకోబు", "యోహాను"],
    grid: [
      ["అ", "జ", "ఐ", "ఠ", "ఏ"],
      ["హా", "ను", "య", "ధ", "పే"],
      ["యో", "య", "ఔ", "ఊ", "తు"],
      ["ఎ", "బు", "కో", "యా", "రు"],
      ["ఈ", "చ", "వ", "జ", "మ"],
    ],
    wordPaths: [
      [[1, 4], [2, 4], [3, 4]],
      [[3, 3], [3, 2], [3, 1]],
      [[2, 0], [1, 0], [1, 1]],
    ],
  },
  {
    id: "18",
    number: "N18",
    title: "ఆత్మ ఫలములు ఏమేమి?",
    description:
      "గలతీయులు 5:22-23 ప్రకారం, పరస్పరం ఆనుకుని ఉన్న అక్షరాలను లాగి అన్ని ఆత్మ ఫలములను కనుగొనండి.",
    type: "path",
    rows: 8,
    cols: 8,
    words: [
      "ప్రేమ",
      "సంతోషము",
      "సమాధానము",
      "దీర్ఘశాంతము",
      "దయాళుత్వము",
      "మంచితనము",
      "విశ్వాసము",
      "సాత్వికము",
      "ఆశానిగ్రహము",
    ],
    grid: [
      ["అ", "ద", "వ", "స", "ఫ", "ఇ", "తో", "సం"],
      ["ళు", "యా", "ప్రే", "ర", "ఒ", "ము", "ష", "శ"],
      ["త్వ", "ఔ", "మ", "ని", "గ్ర", "హ", "ము", "త"],
      ["ము", "శ", "ఆ", "శా", "మా", "స", "ఠ", "ఉ"],
      ["వి", "శ్వా", "స", "ఏ", "ధా", "ట", "ము", "త"],
      ["చి", "త", "ము", "సా", "న", "భ", "ధ", "శాం"],
      ["మం", "న", "క", "త్వి", "ము", "ఝ", "డ", "ర్ఘ"],
      ["ఫ", "ము", "ము", "త", "ఠ", "ణ", "ట", "దీ"],
    ],
    wordPaths: [
      [[1, 2], [2, 2]],
      [[0, 7], [0, 6], [1, 6], [1, 5]],
      [[3, 5], [3, 4], [4, 4], [5, 4], [6, 4]],
      [[7, 7], [6, 7], [5, 7], [4, 7], [4, 6]],
      [[0, 1], [1, 1], [1, 0], [2, 0], [3, 0]],
      [[6, 0], [5, 0], [5, 1], [6, 1], [7, 1]],
      [[4, 0], [4, 1], [4, 2], [5, 2]],
      [[5, 3], [6, 3], [6, 2], [7, 2]],
      [[3, 2], [3, 3], [2, 3], [2, 4], [2, 5], [2, 6]],
    ],
  },
  {
    id: "19",
    number: "N19",
    title: "The Twelve Minor Prophets",
    description:
      "Name the twelve Minor Prophets in the Old Testament. Drag across connected letters to find them all.",
    type: "path",
    rows: 12,
    cols: 12,
    words: [
      "HOSEA",
      "JOEL",
      "AMOS",
      "OBADIAH",
      "JONAH",
      "MICAH",
      "NAHUM",
      "HABAKKUK",
      "ZEPHANIAH",
      "HAGGAI",
      "ZECHARIAH",
      "MALACHI",
    ],
    grid: [
      ["H", "K", "Q", "R", "X", "P", "C", "W", "H", "A", "Z", "J"],
      ["X", "V", "F", "U", "O", "B", "A", "A", "S", "G", "H", "O"],
      ["I", "M", "K", "T", "H", "O", "S", "E", "A", "G", "A", "N"],
      ["E", "Z", "T", "I", "A", "H", "L", "A", "O", "A", "S", "J"],
      ["C", "H", "A", "R", "U", "E", "M", "F", "Y", "I", "M", "C"],
      ["B", "A", "D", "D", "R", "N", "T", "J", "N", "A", "C", "I"],
      ["O", "A", "I", "B", "H", "A", "P", "Z", "Y", "H", "X", "M"],
      ["E", "H", "D", "M", "U", "H", "P", "E", "D", "L", "I", "K"],
      ["K", "U", "K", "K", "D", "A", "H", "L", "A", "C", "H", "J"],
      ["R", "M", "A", "A", "H", "N", "I", "A", "M", "L", "E", "O"],
      ["Y", "O", "S", "B", "A", "I", "A", "H", "J", "S", "R", "D"],
      ["H", "T", "K", "M", "P", "B", "J", "U", "Y", "G", "V", "K"],
    ],
    wordPaths: [
      [[2, 4], [2, 5], [2, 6], [2, 7], [1, 7]],
      [[8, 11], [9, 11], [9, 10], [9, 9]],
      [[9, 2], [9, 1], [10, 1], [10, 2]],
      [[6, 0], [5, 0], [5, 1], [5, 2], [6, 2], [6, 1], [7, 1]],
      [[0, 11], [1, 11], [2, 11], [2, 10], [1, 10]],
      [[6, 11], [5, 11], [5, 10], [5, 9], [6, 9]],
      [[5, 5], [6, 5], [6, 4], [7, 4], [7, 3]],
      [[9, 4], [10, 4], [10, 3], [9, 3], [8, 3], [8, 2], [8, 1], [8, 0]],
      [[6, 7], [7, 7], [7, 6], [8, 6], [8, 5], [9, 5], [9, 6], [10, 6], [10, 7]],
      [[0, 8], [0, 9], [1, 9], [2, 9], [3, 9], [4, 9]],
      [[3, 1], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [3, 3], [3, 4], [3, 5]],
      [[9, 8], [9, 7], [8, 7], [8, 8], [8, 9], [8, 10], [7, 10]],
    ],
  },
  {
    id: "20",
    number: "N20",
    title: "పాత నిబంధనలోని పన్నెండు మంది చిన్న ప్రవక్తల పేర్లు చెప్పండి.",
    description:
      "పరస్పరం ఆనుకుని ఉన్న అక్షరాలను లాగి, పన్నెండు మంది చిన్న ప్రవక్తల పేర్లను కనుగొనండి.",
    type: "path",
    rows: 8,
    cols: 8,
    words: [
      "హోషేయ",
      "యోవేలు",
      "ఆమోసు",
      "ఓబద్యా",
      "యోనా",
      "మీకా",
      "నహూము",
      "హబక్కూకు",
      "జెఫన్యా",
      "హగ్గయి",
      "జెకర్యా",
      "మలాకీ",
    ],
    grid: [
      ["యో", "ఈ", "హ", "బ", "న", "ష", "జ", "ర్యా"],
      ["వే", "న్యా", "కు", "క్కూ", "హూ", "ము", "జె", "క"],
      ["లు", "ఫ", "షే", "హో", "ఓ", "ఐ", "ట", "నా"],
      ["ఢ", "జె", "య", "చ", "ఈ", "థ", "ఆ", "యో"],
      ["ఎ", "ఔ", "ణ", "కా", "మీ", "ల", "గ్గ", "యి"],
      ["ద్యా", "ఊ", "ఈ", "మ", "మో", "సు", "హ", "మ"],
      ["బ", "ఓ", "ఫ", "లా", "ఆ", "ట", "ఠ", "ఫ"],
      ["ఏ", "ప", "ఔ", "కీ", "ఠ", "చ", "బ", "న"],
    ],
    wordPaths: [
      [[2, 3], [2, 2], [3, 2]],
      [[0, 0], [1, 0], [2, 0]],
      [[6, 4], [5, 4], [5, 5]],
      [[6, 1], [6, 0], [5, 0]],
      [[3, 7], [2, 7]],
      [[4, 4], [4, 3]],
      [[0, 4], [1, 4], [1, 5]],
      [[0, 2], [0, 3], [1, 3], [1, 2]],
      [[3, 1], [2, 1], [1, 1]],
      [[5, 6], [4, 6], [4, 7]],
      [[1, 6], [1, 7], [0, 7]],
      [[5, 3], [6, 3], [7, 3]],
    ],
  },
  {
    id: "21",
    number: "N21",
    title: "అబ్రాహాము జీవితంలోని వ్యక్తులు",
    description:
      "అబ్రాహాము జీవితంలోని వ్యక్తుల పేర్లను అక్షరాలను కలుపుతూ గుర్తించండి. అబ్రాహాము జీవితంలో ఉన్న వ్యక్తులందరి పేర్లను కనుగొనండి.",
    type: "path",
    rows: 5,
    cols: 5,
    words: ["ఇస్సాకు", "శారా", "హాగరు", "లోతు", "ఇష్మాయేలు"],
    grid: [
      ["గ", "బ", "య", "లు", "ఇ"],
      ["ఇ", "శా", "రా", "యే", "ష్మా"],
      ["స్సా", "కు", "భ", "రు", "గ"],
      ["గ", "ద", "ఔ", "ఉ", "హా"],
      ["ఊ", "తు", "లో", "ఓ", "ఊ"],
    ],
    wordPaths: [
      [[1, 0], [2, 0], [2, 1]],
      [[1, 1], [1, 2]],
      [[3, 4], [2, 4], [2, 3]],
      [[4, 2], [4, 1]],
      [[0, 4], [1, 4], [1, 3], [0, 3]],
    ],
  },
  {
    id: "22",
    number: "N22",
    title: "కొత్త నిబంధన పుస్తకాలను సరైన క్రమంలో అమర్చండి.",
    description:
      "ప్రతి పుస్తకాన్ని పైన ఉన్న పెట్టెలో సరైన క్రమంలో లాగి ఉంచండి.",
    type: "order",
    items: [
      "మత్తయి సువార్త",
      "మార్కు సువార్త",
      "లూకా సువార్త",
      "యోహాను సువార్త",
      "అపొస్తలుల కార్యములు",
      "రోమీయులకు",
      "1 కొరింథీయులకు",
      "2 కొరింథీయులకు",
      "గలతీయులకు",
      "ఎఫెసీయులకు",
      "ఫిలిప్పీయులకు",
      "కొలొస్సీయులకు",
      "1 థెస్సలొనీకయులకు",
      "2 థెస్సలొనీకయులకు",
      "1 తిమోతికి",
      "2 తిమోతికి",
      "తీతుకు",
      "ఫిలేమోనుకు",
      "హెబ్రీయులకు",
      "యాకోబు",
      "1 పేతురు",
      "2 పేతురు",
      "1 యోహాను",
      "2 యోహాను",
      "3 యోహాను",
      "యూదా",
      "ప్రకటన గ్రంథము",
    ],
  },
  {
    id: "23",
    number: "N23",
    title: "Names, Places and Things in the Book of Jonah",
    description:
      "Find the names, places, and things found in the book of Jonah. Drag across connected letters to find them all.",
    type: "path",
    rows: 10,
    cols: 10,
    words: [
      "AMITTAI",
      "NINEVEH",
      "SAILORS",
      "GOD",
      "TARSHISH",
      "JOPPA",
      "SEA",
      "FISH",
      "WIND",
      "PLANT",
    ],
    grid: [
      ["O", "A", "G", "O", "B", "I", "T", "T", "G", "A"],
      ["Y", "O", "M", "D", "N", "M", "I", "A", "I", "T"],
      ["A", "O", "J", "S", "Y", "A", "H", "P", "R", "A"],
      ["J", "O", "Z", "R", "I", "A", "I", "N", "S", "H"],
      ["P", "P", "Z", "O", "L", "S", "N", "E", "S", "I"],
      ["A", "H", "S", "R", "F", "I", "E", "V", "H", "T"],
      ["V", "N", "O", "G", "H", "S", "H", "K", "O", "J"],
      ["Q", "D", "S", "T", "E", "E", "T", "Y", "G", "U"],
      ["I", "N", "D", "P", "O", "S", "S", "T", "A", "N"],
      ["W", "S", "R", "A", "O", "A", "E", "P", "L", "T"],
    ],
    wordPaths: [
      [[2, 5], [1, 5], [1, 6], [0, 6], [0, 7], [1, 7], [1, 8]],
      [[3, 7], [3, 6], [4, 6], [4, 7], [5, 7], [5, 6], [6, 6]],
      [[4, 5], [3, 5], [3, 4], [4, 4], [4, 3], [5, 3], [5, 2]],
      [[0, 2], [0, 3], [1, 3]],
      [[1, 9], [2, 9], [2, 8], [3, 8], [3, 9], [4, 9], [4, 8], [5, 8]],
      [[3, 0], [3, 1], [4, 1], [4, 0], [5, 0]],
      [[8, 6], [9, 6], [9, 5]],
      [[5, 4], [5, 5], [6, 5], [6, 4]],
      [[9, 0], [8, 0], [8, 1], [7, 1]],
      [[9, 7], [9, 8], [8, 8], [8, 9], [9, 9]],
    ],
  },
  {
    id: "24",
    number: "N24",
    title: "యోనా గ్రంథంలోని ముఖ్యమైన వ్యక్తులు, ప్రదేశాలు మరియు విషయాలను గుర్తించండి.",
    description:
      "పరస్పరం ఆనుకుని ఉన్న అక్షరాలను లాగి, యోనా గ్రంథంలోని వ్యక్తులు, ప్రదేశాలు మరియు విషయాలను కనుగొనండి.",
    type: "path",
    rows: 8,
    cols: 8,
    words: [
      "యోనా",
      "అమిత్తయి",
      "నీనెవె",
      "నావికులు",
      "దేవుడు",
      "తర్షీషు",
      "యొప్పా",
      "సముద్రము",
      "మత్స్యము",
      "గాలి",
      "చెట్టు",
    ],
    grid: [
      ["ద్ర", "ము", "ల", "యో", "మి", "త్త", "దే", "థ"],
      ["ము", "స", "ప్పా", "నా", "అ", "యి", "వు", "డు"],
      ["చె", "ట్టు", "యొ", "ఇ", "గా", "త్స్య", "మ", "అ"],
      ["జ", "శ", "య", "న", "లి", "ము", "క", "స"],
      ["ష", "ఆ", "ఠ", "స", "షు", "ఖ", "ఛ", "గ"],
      ["ఢ", "వి", "కు", "త", "ర్షీ", "ఢ", "ఓ", "ఇ"],
      ["ఘ", "నా", "లు", "వె", "ట", "ఓ", "ఝ", "జ"],
      ["బ", "మ", "డ", "నె", "నీ", "ల", "మ", "ష"],
    ],
    wordPaths: [
      [[0, 3], [1, 3]],
      [[1, 4], [0, 4], [0, 5], [1, 5]],
      [[7, 4], [7, 3], [6, 3]],
      [[6, 1], [5, 1], [5, 2], [6, 2]],
      [[0, 6], [1, 6], [1, 7]],
      [[5, 3], [5, 4], [4, 4]],
      [[2, 2], [1, 2]],
      [[1, 1], [0, 1], [0, 0], [1, 0]],
      [[2, 6], [2, 5], [3, 5]],
      [[2, 4], [3, 4]],
      [[2, 0], [2, 1]],
    ],
  },
  {
    id: "25",
    number: "N25",
    title: "కీర్తనలు 1వ అధ్యాయము: ఖాళీలను పూరించండి.",
    description:
      "క్రింది వాక్యాలలోని ఖాళీలలో సరైన పదాన్ని లాగి ఉంచండి.",
    type: "fill",
    sentences: [
      { text: "దుష్టుల ఆలోచనచొప్పున ___ పాపుల మార్గమున ___ అపహాసకులు కూర్చుండు చోటను ___", answers: ["నడువక", "నిలువక", "కూర్చుండక"] },
      { text: "యెహోవా ధర్మశాస్త్రమునందు ___ దివారాత్రము దానిని ___ ధన్యుడు.", answers: ["ఆనందించుచు", "ధ్యానించువాడు"] },
      { text: "అతడు ___ యోరను నాటబడినదై ఆకు వాడక తన కాలమందు ___ చెట్టువలె నుండును అతడు చేయునదంతయు ___.", answers: ["నీటికాలువల", "ఫలమిచ్చు", "సఫలమగును"] },
      { text: "దుష్టులు ఆలాగున నుండక గాలి చెదరగొట్టు ___ నుందురు.", answers: ["పొట్టువలె"] },
      { text: "కాబట్టి ___ దుష్టులును ___ సభలో పాపులును నిలువరు.", answers: ["న్యాయవిమర్శలో", "నీతిమంతుల"] },
      { text: "నీతిమంతుల మార్గము యెహోవాకు తెలియును దుష్టుల మార్గము ___ నడుపును.", answers: ["నాశనమునకు"] },
    ],
  },
  {
    id: "26",
    number: "N26",
    title: "Psalm 1: Fill the blanks",
    description:
      "Drag each word into the correct blank to complete Psalm 1 (NIV 1984).",
    type: "fill",
    sentences: [
      { text: "Blessed is the man who does not ___ in the counsel of the wicked or ___ in the way of sinners or sit in the ___ of mockers.", answers: ["walk", "stand", "seat"] },
      { text: "But his ___ is in the law of the LORD, and on his law he ___ day and night.", answers: ["delight", "meditates"] },
      { text: "He is like a tree planted by ___, which yields its ___ in season and whose leaf does not wither. Whatever he does ___.", answers: ["streams of water", "fruit", "prospers"] },
      { text: "Not so the wicked! They are like ___ that the wind blows away.", answers: ["chaff"] },
      { text: "Therefore the wicked will not stand in the ___, nor sinners in the assembly of the ___.", answers: ["judgment", "righteous"] },
      { text: "For the LORD watches over the way of the righteous, but the way of the wicked will ___.", answers: ["perish"] },
    ],
  },
];

export function getPuzzleById(id: string | undefined) {
  return BIBLE_PUZZLES.find((puzzle) => puzzle.id === id);
}

// A puzzle counts as Telugu if its title is written in the Telugu script,
// rather than tracking language as separate metadata — so a puzzle added
// with a Telugu title lands in the Telugu panel with no extra step.
const TELUGU_SCRIPT = /[ఀ-౿]/;
export function isTeluguPuzzle(puzzle: BiblePuzzle) {
  return TELUGU_SCRIPT.test(puzzle.title);
}
