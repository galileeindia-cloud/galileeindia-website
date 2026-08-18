import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPuzzleById } from "@/data/biblePuzzles";
import { fetchLeaderboard } from "@/services/leaderboardService";
import { formatDuration } from "@/utils/time";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ id: string }> };

const MEDALS = ["🥇", "🥈", "🥉"];

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const puzzle = getPuzzleById(id);
  if (!puzzle) return { title: "Bible Quiz" };
  return pageMetadata({
    title: `${puzzle.title} Leaderboard | Bible Quiz`,
    description: `See the fastest times for the ${puzzle.title} Bible quiz.`,
    path: `/bible-puzzle/${puzzle.id}/leaderboard`,
    image: "/bible-puzzle/opengraph-image",
  });
}

export default async function BiblePuzzleLeaderboardPage({ params }: Props) {
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

  let entries: Awaited<ReturnType<typeof fetchLeaderboard>> = [];
  let error = false;

  try {
    entries = await fetchLeaderboard(puzzle.id, 25);
  } catch (err) {
    console.error("Leaderboard fetch failed:", err);
    error = true;
  }

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-12 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Link
            href={`/bible-puzzle/${puzzle.id}`}
            className="inline-flex items-center gap-2 text-blue-700 font-semibold mb-6"
          >
            <ArrowLeft size={18} />
            Back to Puzzle {puzzle.number}
          </Link>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={22} className="text-blue-900" />
            <p className="text-sm font-semibold tracking-widest text-blue-700 uppercase">
              Leaderboard
            </p>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 text-center mb-10">
            {puzzle.title}
          </h1>

          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            {error && (
              <p className="text-center text-gray-500 py-6">
                Leaderboard isn&rsquo;t available right now. Please try again later.
              </p>
            )}

            {!error && entries.length === 0 && (
              <p className="text-center text-gray-500 py-6">
                No one has completed this puzzle yet. Be the first!
              </p>
            )}

            {!error && entries.length > 0 && (
              <ol className="flex flex-col gap-2">
                {entries.map((entry, index) => (
                  <li
                    key={entry.score_uuid}
                    className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3"
                  >
                    <span className="w-8 shrink-0 text-center font-bold text-blue-900">
                      {MEDALS[index] ?? `#${index + 1}`}
                    </span>
                    <span className="flex-1 truncate font-medium text-gray-900">
                      {entry.player_name}
                    </span>
                    <span className="shrink-0 text-sm text-gray-600">
                      {formatDuration(entry.time_taken_ms)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex justify-center mt-8">
            <Link
              href={`/bible-puzzle/${puzzle.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition"
            >
              Play This Puzzle
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
