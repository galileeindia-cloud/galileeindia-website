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

export type BiblePuzzle = OrderPuzzleData | MatchPuzzleData;

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
];

export function getPuzzleById(id: string | undefined) {
  return BIBLE_PUZZLES.find((puzzle) => puzzle.id === id);
}
