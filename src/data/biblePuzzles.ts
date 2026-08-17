export type BiblePuzzle = {
  id: string;
  number: string;
  title: string;
  description: string;
  items: string[];
};

export const BIBLE_PUZZLES: BiblePuzzle[] = [
  {
    id: "1",
    number: "N01",
    title: "Books of the New Testament",
    description: "Drag each book into the top panel, in the correct order.",
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
];

export function getPuzzleById(id: string | undefined) {
  return BIBLE_PUZZLES.find((puzzle) => puzzle.id === id);
}
