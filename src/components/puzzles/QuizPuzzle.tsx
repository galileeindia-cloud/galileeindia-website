"use client";

import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import Celebration from "./Celebration";
import Leaderboard from "./Leaderboard";
import {
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
} from "@/services/leaderboardService";
import { formatDuration } from "@/utils/time";
import type { QuizQuestion } from "@/data/biblePuzzles";

type Phase = "name" | "playing" | "complete";

type RunQuestion = { question: string; options: string[]; correctIndex: number };

const NAME_STORAGE_KEY = "biblePuzzlePlayerName";

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Re-shuffles both question order and each question's option order per
// playthrough, so a replay doesn't just show the same layout again.
function buildRun(questions: QuizQuestion[]): RunQuestion[] {
  return shuffle(questions).map((q) => {
    const correctAnswer = q.options[q.correctIndex];
    const options = shuffle(q.options);
    return { question: q.question, options, correctIndex: options.indexOf(correctAnswer) };
  });
}

export default function QuizPuzzle({
  puzzleId,
  questions,
}: {
  puzzleId: string;
  questions: QuizQuestion[];
}) {
  const [phase, setPhase] = useState<Phase>("name");
  const [name, setName] = useState("");
  const [run, setRun] = useState<RunQuestion[]>(() => buildRun(questions));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [finishedMs, setFinishedMs] = useState<number | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [currentScoreUuid, setCurrentScoreUuid] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(NAME_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setName(saved);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [phase]);

  async function recordScore(timeTakenMs: number, finalScore: number) {
    setLeaderboardLoading(true);
    setLeaderboardError(false);
    try {
      const { score_uuid } = await submitScore(puzzleId, name, timeTakenMs, finalScore);
      setCurrentScoreUuid(score_uuid);
      const entries = await fetchLeaderboard(puzzleId);
      setLeaderboard(entries);
    } catch (err) {
      console.error("Leaderboard submit/fetch failed:", err);
      setLeaderboardError(true);
    } finally {
      setLeaderboardLoading(false);
    }
  }

  function startPuzzle() {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    setName(trimmed);
    setRun(buildRun(questions));
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function restart() {
    setRun(buildRun(questions));
    setCurrentIndex(0);
    setSelected(null);
    setScore(0);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function selectOption(i: number) {
    if (selected !== null) return;
    setSelected(i);
    if (i === run[currentIndex].correctIndex) {
      setScore((s) => s + 1);
    }
  }

  function nextQuestion() {
    if (currentIndex + 1 < run.length) {
      setCurrentIndex((idx) => idx + 1);
      setSelected(null);
      return;
    }
    if (!startTime) return;
    const elapsed = Date.now() - startTime;
    setFinishedMs(elapsed);
    setPhase("complete");
    recordScore(elapsed, score);
  }

  const elapsedMs = startTime ? now - startTime : 0;

  if (phase === "name") {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-md border border-gray-100 p-8 text-center">
        <h2 className="text-xl font-bold text-blue-900 mb-2">What&rsquo;s your name?</h2>
        <p className="text-gray-500 mb-6">
          We&rsquo;ll cheer for you by name when you finish!
        </p>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && startPuzzle()}
          placeholder="Enter your name"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white text-gray-900 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <button
          type="button"
          onClick={startPuzzle}
          disabled={!name.trim()}
          className="w-full px-6 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Start Puzzle
        </button>
      </div>
    );
  }

  if (phase === "complete") {
    return (
      <div className="max-w-lg mx-auto text-center">
        <Celebration />

        <div className="relative z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-10 animate-pop-in">
          <p className="text-5xl mb-4">🎉🌸✨</p>

          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 mb-3">
            Congratulations, {name}!
          </h2>

          <p className="text-lg text-gray-700 mb-2">
            You scored{" "}
            <span className="font-bold text-blue-900">
              {score} / {run.length}
            </span>{" "}
            in{" "}
            <span className="font-bold text-blue-900">
              {formatDuration(finishedMs ?? 0)}
            </span>
            . Well done! 🙌
          </p>

          <button
            type="button"
            onClick={restart}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition"
          >
            <RotateCcw size={18} />
            Play Again
          </button>

          <Leaderboard
            puzzleId={puzzleId}
            entries={leaderboard}
            currentScoreUuid={currentScoreUuid}
            loading={leaderboardLoading}
            error={leaderboardError}
          />
        </div>
      </div>
    );
  }

  const current = run[currentIndex];
  const progress = ((currentIndex + (selected !== null ? 1 : 0)) / run.length) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <p className="text-gray-600">
          Go, <span className="font-semibold text-blue-900">{name}</span>!
        </p>
        <p className="font-mono text-lg font-bold text-blue-900">
          ⏱ {formatDuration(elapsedMs)}
        </p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
        <span>
          Question {currentIndex + 1} of {run.length}
        </span>
        <span>
          Score: <span className="font-semibold text-blue-900">{score}</span>
        </span>
      </div>

      <div className="h-2 rounded-full bg-gray-200 overflow-hidden mb-8">
        <div
          className="h-full bg-blue-700 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-bold text-blue-900 text-center mb-8">
          {current.question}
        </h2>

        <div className="flex flex-col gap-3">
          {current.options.map((option, i) => {
            const isCorrect = i === current.correctIndex;
            const isSelected = i === selected;

            let className =
              "w-full text-left px-5 py-3.5 rounded-xl border-2 font-semibold transition ";
            if (selected === null) {
              className += "bg-white border-gray-200 text-gray-800 hover:border-blue-400 hover:bg-blue-50";
            } else if (isCorrect) {
              className += "bg-emerald-500 border-emerald-600 text-white";
            } else if (isSelected) {
              className += "bg-rose-500 border-rose-600 text-white";
            } else {
              className += "bg-gray-50 border-gray-100 text-gray-400";
            }

            return (
              <button
                key={option}
                type="button"
                onClick={() => selectOption(i)}
                disabled={selected !== null}
                className={className}
              >
                {option}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="flex justify-center mt-8">
            <button
              type="button"
              onClick={nextQuestion}
              className="px-6 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition"
            >
              {currentIndex + 1 < run.length ? "Next Question" : "See Results"}
            </button>
          </div>
        )}
      </div>

      <div className="flex justify-center mt-6">
        <button
          type="button"
          onClick={restart}
          className="text-sm text-gray-500 hover:text-gray-700 hover:underline"
        >
          Start Over
        </button>
      </div>
    </div>
  );
}
