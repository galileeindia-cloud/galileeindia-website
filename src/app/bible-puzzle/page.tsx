import Link from "next/link";
import { Puzzle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BIBLE_PUZZLES, type BiblePuzzle } from "@/data/biblePuzzles";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata({
  title: "Bible Quiz",
  description:
    "Play a Bible ordering puzzle, race the clock, and see how you rank on the leaderboard.",
  path: "/bible-puzzle",
});

// A puzzle is sorted into the Telugu column if its title is written in the
// Telugu script, rather than tracking language as separate metadata — so
// a puzzle added with a Telugu title lands in the right column with no
// extra step.
const TELUGU_SCRIPT = /[ఀ-౿]/;
const isTelugu = (puzzle: BiblePuzzle) => TELUGU_SCRIPT.test(puzzle.title);

function PuzzleCard({ puzzle }: { puzzle: BiblePuzzle }) {
  return (
    <Link
      href={`/bible-puzzle/${puzzle.id}`}
      className="group bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 p-6 transition hover:-translate-y-1"
    >
      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-900 text-white mb-4">
        <Puzzle size={22} />
      </span>

      <p className="text-sm font-semibold tracking-widest text-blue-700 uppercase mb-1">
        Puzzle {puzzle.number}
      </p>

      <h2 className="text-xl font-bold text-gray-900 mb-2">{puzzle.title}</h2>

      <p className="text-gray-600">{puzzle.description}</p>
    </Link>
  );
}

export default function BiblePuzzlePage() {
  const englishPuzzles = BIBLE_PUZZLES.filter((puzzle) => !isTelugu(puzzle));
  const teluguPuzzles = BIBLE_PUZZLES.filter(isTelugu);

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 text-center mb-4">
            Bible Quiz
          </h1>

          <p className="text-center text-xl text-gray-600 mb-12">
            A new puzzle from time to time. Tap a puzzle below to play.
          </p>

          <div className="grid md:grid-cols-2 md:gap-12">
            <div className="md:pr-6">
              <h2 className="text-center text-lg font-bold text-blue-900 uppercase tracking-widest mb-6">
                English
              </h2>
              <div className="flex flex-col gap-6">
                {englishPuzzles.map((puzzle) => (
                  <PuzzleCard key={puzzle.id} puzzle={puzzle} />
                ))}
              </div>
            </div>

            <div className="mt-14 md:mt-0 md:pl-6 md:border-l md:border-gray-200">
              <h2 className="text-center text-lg font-bold text-blue-900 uppercase tracking-widest mb-6">
                తెలుగు
              </h2>
              <div className="flex flex-col gap-6">
                {teluguPuzzles.map((puzzle) => (
                  <PuzzleCard key={puzzle.id} puzzle={puzzle} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
