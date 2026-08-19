import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import OrderPuzzle from "@/components/puzzles/OrderPuzzle";
import MatchPuzzle from "@/components/puzzles/MatchPuzzle";
import { getPuzzleById } from "@/data/biblePuzzles";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const puzzle = getPuzzleById(id);
  if (!puzzle) return { title: "Bible Quiz" };
  return pageMetadata({
    title: `${puzzle.title} | Bible Quiz`,
    description: puzzle.description,
    path: `/bible-puzzle/${puzzle.id}`,
    image: "/bible-puzzle/opengraph-image",
  });
}

export default async function BiblePuzzlePlayPage({ params }: Props) {
  const { id } = await params;
  const puzzle = getPuzzleById(id);

  if (!puzzle) {
    return (
      <>
        <Navbar />

        <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-3xl font-bold text-blue-900">Puzzle not found</h1>
          <Link href="/bible-puzzle" className="text-blue-700 font-semibold">
            Back to all puzzles
          </Link>
        </div>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-12 sm:py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm font-semibold tracking-widest text-blue-700 uppercase mb-2">
            Puzzle {puzzle.number}
          </p>

          <h1 className="text-3xl sm:text-5xl font-bold text-blue-900 text-center mb-4">
            {puzzle.title}
          </h1>

          <p className="text-center text-lg text-gray-600 mb-4">{puzzle.description}</p>

          <div className="flex justify-center mb-10">
            <Link
              href={`/bible-puzzle/${puzzle.id}/leaderboard`}
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
            >
              <Trophy size={16} />
              View Leaderboard
            </Link>
          </div>

          {puzzle.type === "order" ? (
            <OrderPuzzle key={puzzle.id} puzzleId={puzzle.id} answerKey={puzzle.items} />
          ) : (
            <MatchPuzzle key={puzzle.id} puzzleId={puzzle.id} groups={puzzle.groups} />
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
