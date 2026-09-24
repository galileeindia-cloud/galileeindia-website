import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { BIBLE_PUZZLES, isTeluguPuzzle, type BiblePuzzle } from "@/data/biblePuzzles";
import { fetchLeaderboard, type LeaderboardEntry } from "@/services/leaderboardService";
import { formatDurationShort } from "@/utils/time";
import { graphemes } from "@/utils/text";
import { pageMetadata } from "@/lib/metadata";

const MEDALS = ["🥇", "🥈", "🥉"];

export const dynamic = "force-dynamic";

export const metadata = pageMetadata({
  title: "Leader Board for all Puzzles",
  description: "See the top three players for every Bible puzzle, in English and Telugu.",
  path: "/bible-puzzle/leaderboard",
  image: "/bible-puzzle/opengraph-image",
});

// Kept short so the grid stays tight. Counts whole letters (graphemes), so a
// Telugu conjunct is never cut in half.
const NAME_LIMIT = 15;
function shortName(title: string) {
  const letters = graphemes(title);
  return letters.length > NAME_LIMIT ? `${letters.slice(0, NAME_LIMIT).join("").trimEnd()}…` : title;
}

type PuzzleResult = { puzzle: BiblePuzzle; entries: LeaderboardEntry[]; failed: boolean };

function LeaderboardTable({ results }: { results: PuzzleResult[] }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-blue-900 text-white text-sm">
            <th scope="col" className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">
              Puzzle Id
            </th>
            <th scope="col" className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">
              Puzzle Name
            </th>
            <th scope="col" className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">
              Player Name
            </th>
            <th scope="col" className="px-3 sm:px-4 py-3 font-semibold whitespace-nowrap">
              Time / Score
            </th>
          </tr>
        </thead>

        {results.map(({ puzzle, entries, failed }) => {
          const rowCount = Math.max(entries.length, 1);
          return (
            <tbody key={puzzle.id} className="border-t border-gray-200">
              {Array.from({ length: rowCount }, (_, index) => {
                const entry = entries[index];
                return (
                  <tr key={index} className="align-top">
                    {index === 0 && (
                      <>
                        <td
                          rowSpan={rowCount}
                          className="px-3 sm:px-4 py-3 font-bold text-blue-900 whitespace-nowrap"
                        >
                          {puzzle.number}
                        </td>
                        <td
                          rowSpan={rowCount}
                          className="px-3 sm:px-4 py-3 font-medium text-gray-900 text-sm max-w-[10rem]"
                        >
                          <Link
                            href={`/bible-puzzle/${puzzle.id}/leaderboard`}
                            title={puzzle.title}
                            className="hover:underline hover:text-blue-700"
                          >
                            {shortName(puzzle.title)}
                          </Link>
                        </td>
                      </>
                    )}

                    {entry ? (
                      <>
                        <td className="px-3 sm:px-4 py-2.5 text-gray-900 whitespace-nowrap">
                          <span className="mr-2">{MEDALS[index]}</span>
                          {entry.player_name}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 text-sm text-gray-600 whitespace-nowrap">
                          {entry.score !== null && (
                            <span className="font-semibold text-blue-900">{entry.score} pts</span>
                          )}
                          {entry.score !== null && " · "}
                          {formatDurationShort(entry.time_taken_ms)}
                        </td>
                      </>
                    ) : (
                      <td colSpan={2} className="px-3 sm:px-4 py-2.5 text-sm text-gray-500">
                        {failed
                          ? "Leaderboard isn’t available right now."
                          : "No scores yet — be the first!"}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          );
        })}
      </table>
    </div>
  );
}

export default async function AllPuzzlesLeaderboardPage() {
  // Newest first, matching the order of the puzzle list.
  const puzzles = [...BIBLE_PUZZLES].sort((a, b) => Number(b.id) - Number(a.id));

  const results: PuzzleResult[] = await Promise.all(
    puzzles.map(async (puzzle) => {
      try {
        return { puzzle, entries: await fetchLeaderboard(puzzle.id, 3), failed: false };
      } catch (err) {
        console.error(`Leaderboard fetch failed for puzzle ${puzzle.id}:`, err);
        return { puzzle, entries: [], failed: true };
      }
    })
  );

  const english = results.filter(({ puzzle }) => !isTeluguPuzzle(puzzle));
  const telugu = results.filter(({ puzzle }) => isTeluguPuzzle(puzzle));

  return (
    <>
      <Navbar />

      <section className="bg-gray-50 min-h-screen py-12 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <Link
            href="/bible-puzzle"
            className="inline-flex items-center gap-2 text-blue-700 font-semibold mb-6"
          >
            <ArrowLeft size={18} />
            Back to all puzzles
          </Link>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Trophy size={22} className="text-blue-900" />
            <p className="text-sm font-semibold tracking-widest text-blue-700 uppercase">
              Top 3 per puzzle
            </p>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 text-center mb-10">
            Leader Board for all Puzzles
          </h1>

          <div className="grid xl:grid-cols-2 gap-10 items-start">
            <div className="min-w-0">
              <h2 className="text-center text-lg font-bold text-blue-900 uppercase tracking-widest mb-6">
                తెలుగు
              </h2>
              <LeaderboardTable results={telugu} />
            </div>

            <div className="min-w-0">
              <h2 className="text-center text-lg font-bold text-blue-900 uppercase tracking-widest mb-6">
                English
              </h2>
              <LeaderboardTable results={english} />
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}
