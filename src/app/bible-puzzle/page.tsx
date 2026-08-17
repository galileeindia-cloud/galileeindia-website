import type { Metadata } from "next";
import Link from "next/link";
import { Puzzle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BIBLE_PUZZLES } from "@/data/biblePuzzles";

export const metadata: Metadata = {
  title: "Bible Quiz | Galilee Prayer Fellowship",
  description:
    "Play a Bible ordering puzzle, race the clock, and see how you rank on the leaderboard.",
};

export default function BiblePuzzlePage() {
  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-20">
        <div className="max-w-5xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-900 text-center mb-4">
            Bible Quiz
          </h1>

          <p className="text-center text-xl text-gray-600 mb-12">
            A new puzzle from time to time. Tap a puzzle below to play.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {BIBLE_PUZZLES.map((puzzle) => (
              <Link
                key={puzzle.id}
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
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
