"use client";

import { useEffect, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { RotateCcw } from "lucide-react";
import PuzzleColumn from "./PuzzleColumn";
import SortableItem from "./SortableItem";
import Celebration from "./Celebration";
import Leaderboard from "./Leaderboard";
import {
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
} from "@/services/leaderboardService";
import { formatDuration } from "@/utils/time";
import type { MatchGroup } from "@/data/biblePuzzles";

type Containers = Record<string, string[]>;
type Phase = "name" | "playing" | "complete";

const NAME_STORAGE_KEY = "biblePuzzlePlayerName";
const POOL = "pool";

// Group labels can collide with book titles that are also group labels
// (e.g. the book "John" vs. the author group "John"), so container ids for
// groups are namespaced separately from the plain item ids used in "pool".
function groupKey(label: string) {
  return `group:${label}`;
}

function shuffle(items: string[]) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function MatchPuzzle({
  puzzleId,
  groups,
}: {
  puzzleId: string;
  groups: MatchGroup[];
}) {
  const allItems = groups.flatMap((g) => g.items);
  const correctGroupOf = new Map<string, string>();
  groups.forEach((g) => g.items.forEach((item) => correctGroupOf.set(item, g.label)));

  function emptyBins(): Containers {
    return Object.fromEntries(groups.map((g) => [groupKey(g.label), []]));
  }

  const [phase, setPhase] = useState<Phase>("name");
  const [name, setName] = useState("");
  const [containers, setContainers] = useState<Containers>(() => ({
    [POOL]: shuffle(allItems),
    ...emptyBins(),
  }));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [finishedMs, setFinishedMs] = useState<number | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [currentScoreUuid, setCurrentScoreUuid] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

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

  async function recordScore(timeTakenMs: number) {
    setLeaderboardLoading(true);
    setLeaderboardError(false);
    try {
      const { score_uuid } = await submitScore(puzzleId, name, timeTakenMs);
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

  useEffect(() => {
    if (phase !== "playing") return;
    if (containers[POOL].length > 0) return;

    const isCorrect = groups.every((g) =>
      containers[groupKey(g.label)].every((item) => correctGroupOf.get(item) === g.label)
    );

    if (isCorrect && startTime) {
      const elapsed = Date.now() - startTime;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFinishedMs(elapsed);
      setPhase("complete");
      recordScore(elapsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containers, phase, startTime]);

  function startPuzzle() {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    setName(trimmed);
    setContainers({ [POOL]: shuffle(allItems), ...emptyBins() });
    setSelectedId(null);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function restart() {
    setContainers({ [POOL]: shuffle(allItems), ...emptyBins() });
    setSelectedId(null);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function findContainer(id: string): string | undefined {
    return Object.keys(containers).find((key) => containers[key].includes(id));
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeContainer = findContainer(String(active.id));
    const overId = String(over.id);
    const overContainer = containers[overId] ? overId : findContainer(overId);

    if (!activeContainer || !overContainer || activeContainer === overContainer) return;

    setContainers((prev) => {
      const activeItems = prev[activeContainer];
      const overItems = prev[overContainer];
      const overIndex = overItems.indexOf(overId);
      const newIndex = overIndex >= 0 ? overIndex : overItems.length;

      return {
        ...prev,
        [activeContainer]: activeItems.filter((item) => item !== active.id),
        [overContainer]: [
          ...overItems.slice(0, newIndex),
          String(active.id),
          ...overItems.slice(newIndex),
        ],
      };
    });
  }

  function handleDragEnd() {
    setActiveId(null);
  }

  function moveItem(id: string, from: string, to: string) {
    setContainers((prev) => ({
      ...prev,
      [from]: prev[from].filter((item) => item !== id),
      [to]: [...prev[to], id],
    }));
  }

  function tapPoolItem(id: string) {
    setSelectedId((current) => (current === id ? null : id));
  }

  function tapPlacedItem(id: string, from: string) {
    moveItem(id, from, POOL);
    if (selectedId === id) setSelectedId(null);
  }

  function tapBin(groupLabel: string) {
    if (!selectedId) return;
    moveItem(selectedId, POOL, groupKey(groupLabel));
    setSelectedId(null);
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

          <p className="text-lg text-gray-700 mb-8">
            You matched all {allItems.length} books to their authors in{" "}
            <span className="font-bold text-blue-900">
              {formatDuration(finishedMs ?? 0)}
            </span>
            . Well done! 🙌
          </p>

          <button
            type="button"
            onClick={restart}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition"
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-600">
          Go, <span className="font-semibold text-blue-900">{name}</span>!
        </p>
        <p className="font-mono text-lg font-bold text-blue-900">
          ⏱ {formatDuration(elapsedMs)}
        </p>
      </div>

      {selectedId && (
        <p className="text-center text-sm font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-lg py-2 mb-4">
          &ldquo;{selectedId}&rdquo; selected — tap an author below to place it
        </p>
      )}

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <h3 className="font-bold text-blue-900 mb-3 text-center">Sort by Author</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10">
          {groups.map((g) => (
            <PuzzleColumn
              key={g.label}
              id={groupKey(g.label)}
              title={g.label}
              items={containers[groupKey(g.label)]}
              emptyHint="Tap or drag here"
              onColumnTap={() => tapBin(g.label)}
              pending={Boolean(selectedId)}
              compact
            >
              {containers[groupKey(g.label)].map((id) => (
                <SortableItem
                  key={id}
                  id={id}
                  label={id}
                  onTap={() => tapPlacedItem(id, groupKey(g.label))}
                />
              ))}
            </PuzzleColumn>
          ))}
        </div>

        <PuzzleColumn
          id={POOL}
          title="All Books (jumbled)"
          items={containers[POOL]}
          emptyHint="All books placed!"
        >
          {containers[POOL].map((id) => (
            <SortableItem
              key={id}
              id={id}
              label={id}
              selected={selectedId === id}
              onTap={() => tapPoolItem(id)}
            />
          ))}
        </PuzzleColumn>

        <DragOverlay>
          {activeId ? (
            <div className="rounded-xl border border-blue-400 bg-white px-3 py-3 shadow-lg font-medium text-gray-900">
              {activeId}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex justify-center mt-8">
        <button
          type="button"
          onClick={restart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          <RotateCcw size={16} />
          Start Over
        </button>
      </div>
    </div>
  );
}
