"use client";

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { RotateCcw } from "lucide-react";
import Celebration from "./Celebration";
import Leaderboard from "./Leaderboard";
import {
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
} from "@/services/leaderboardService";
import { formatDuration } from "@/utils/time";
import type { FillSentence } from "@/data/biblePuzzles";

type Phase = "name" | "playing" | "complete";
type Slots = (string | null)[];

const NAME_STORAGE_KEY = "biblePuzzlePlayerName";
const POOL = "pool";
const BLANK = "___";
const slotId = (index: number) => `slot:${index}`;

// Below Tailwind's `lg` breakpoint the word bank becomes a tray pinned to the
// bottom of the screen, so it is not a separate scroll away from the sentences.
const COMPACT_QUERY = "(max-width: 1023px)";
function subscribeCompact(onChange: () => void) {
  const query = window.matchMedia(COMPACT_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}
const useIsCompact = () =>
  useSyncExternalStore(
    subscribeCompact,
    () => window.matchMedia(COMPACT_QUERY).matches,
    () => false
  );

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const chipClass = (selected: boolean, dragging: boolean) =>
  `touch-none select-none inline-flex items-center rounded-full border px-3 py-1.5 sm:px-3.5 sm:py-1 text-[15px] sm:text-lg font-medium text-gray-900 shadow-sm [-webkit-touch-callout:none] cursor-grab active:cursor-grabbing transition ${
    selected
      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
      : "border-gray-200 bg-white hover:border-blue-300"
  } ${dragging ? "opacity-40" : ""}`;

// A word that can be picked up. It is a span (not a div) because it sits inside
// a sentence paragraph. In the word bank a tap selects it; inside a blank the
// blank's own tap handler takes over (the click bubbles up to it).
function Chip({
  word,
  selected = false,
  onTap,
}: {
  word: string;
  selected?: boolean;
  onTap?: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: word });

  return (
    <span
      ref={setNodeRef}
      onClick={onTap}
      onKeyDown={(e) => {
        if (onTap && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onTap();
        }
      }}
      {...attributes}
      {...listeners}
      className={chipClass(selected, isDragging)}
    >
      {word}
    </span>
  );
}

function Blank({
  index,
  word,
  pending,
  onTap,
}: {
  index: number;
  word: string | null;
  pending: boolean;
  onTap: () => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: slotId(index) });

  return (
    <span
      ref={setNodeRef}
      onClick={onTap}
      aria-label={`Blank ${index + 1}`}
      className={`inline-flex items-center justify-center align-middle mx-0.5 sm:mx-1 min-w-[5.5rem] sm:min-w-[6.5rem] min-h-[2.25rem] rounded-lg transition cursor-pointer ${
        word
          ? ""
          : `border-2 border-dashed px-3 ${
              isOver
                ? "border-blue-600 bg-blue-100"
                : pending
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 bg-gray-50"
            }`
      }`}
    >
      {word && <Chip word={word} />}
    </span>
  );
}

function WordBank({ words, selected, onTap, dragging, emptyText }: {
  words: string[];
  emptyText: string;
  selected: string | null;
  onTap: (word: string) => void;
  dragging: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: POOL });

  return (
    <div
      ref={setNodeRef}
      className={`rounded-xl lg:rounded-2xl lg:border-2 lg:border-dashed lg:p-3 lg:min-h-[5rem] transition ${
        isOver && dragging ? "bg-blue-50 lg:border-blue-500" : "lg:border-gray-200 lg:bg-white"
      }`}
    >
      {words.length === 0 ? (
        <p className="text-center text-sm lg:text-base text-gray-500 py-1 lg:py-2">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 lg:gap-2 max-h-[30vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
          {words.map((word) => (
            <Chip key={word} word={word} selected={selected === word} onTap={() => onTap(word)} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FillPuzzle({
  puzzleId,
  sentences,
  telugu = false,
}: {
  puzzleId: string;
  sentences: FillSentence[];
  /** Telugu puzzles get Telugu labels for the word bank. */
  telugu?: boolean;
}) {
  const answers = sentences.flatMap((s) => s.answers);
  // Index of the first blank in each sentence, so every blank has a global slot number.
  const firstSlot = sentences.map((_, i) =>
    sentences.slice(0, i).reduce((sum, s) => sum + s.answers.length, 0)
  );

  const [phase, setPhase] = useState<Phase>("name");
  const [name, setName] = useState("");
  const [slots, setSlots] = useState<Slots>(() => answers.map(() => null));
  // Shuffled once per run; the bank shows whichever of these aren't in a blank.
  const [order, setOrder] = useState<string[]>(answers);
  const [selected, setSelected] = useState<string | null>(null);
  const [activeWord, setActiveWord] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [now, setNow] = useState<number>(() => Date.now());
  const [finishedMs, setFinishedMs] = useState<number | null>(null);

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(false);
  const [currentScoreUuid, setCurrentScoreUuid] = useState<string | null>(null);

  const isCompact = useIsCompact();
  const trayRef = useRef<HTMLDivElement>(null);
  const playAreaRef = useRef<HTMLDivElement>(null);
  const [trayHeight, setTrayHeight] = useState(0);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  useEffect(() => {
    const saved = localStorage.getItem(NAME_STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setName(saved);
  }, []);

  // On a phone, once play starts, bring the game up under the header so the
  // sentences fill the space above the tray instead of the page title.
  useEffect(() => {
    if (phase !== "playing" || !isCompact) return;
    playAreaRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [phase, isCompact]);

  // The tray is fixed-position, so leave matching room at the end of the page
  // for the last sentence and the Start Over button to scroll clear of it.
  useEffect(() => {
    if (phase !== "playing") return;
    const tray = trayRef.current;
    if (!tray) return;
    const observer = new ResizeObserver(() => setTrayHeight(tray.offsetHeight));
    observer.observe(tray);
    return () => observer.disconnect();
  }, [phase]);

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
      setLeaderboard(await fetchLeaderboard(puzzleId));
    } catch (err) {
      console.error("Leaderboard submit/fetch failed:", err);
      setLeaderboardError(true);
    } finally {
      setLeaderboardLoading(false);
    }
  }

  function resetRun() {
    setSlots(answers.map(() => null));
    setOrder(shuffle(answers));
    setSelected(null);
    setActiveWord(null);
    setStartTime(Date.now());
    setNow(Date.now());
    setFinishedMs(null);
    setCurrentScoreUuid(null);
    setPhase("playing");
  }

  function startPuzzle() {
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem(NAME_STORAGE_KEY, trimmed);
    setName(trimmed);
    resetRun();
  }

  const isSolved = (candidate: Slots) => candidate.every((word, i) => word === answers[i]);

  function commit(next: Slots) {
    setSlots(next);
    setSelected(null);
    if (isSolved(next) && startTime) {
      const elapsed = Date.now() - startTime;
      setFinishedMs(elapsed);
      setPhase("complete");
      recordScore(elapsed);
    }
  }

  function placeWord(word: string, slotIndex: number) {
    const from = slots.indexOf(word);
    if (from === slotIndex) return;
    const next = [...slots];
    // Dropping onto a filled blank sends that word back to the bank, or into
    // the blank this word just left when it was dragged from another blank.
    if (from !== -1) next[from] = next[slotIndex];
    next[slotIndex] = word;
    commit(next);
  }

  function returnWord(word: string) {
    const from = slots.indexOf(word);
    if (from === -1) return;
    const next = [...slots];
    next[from] = null;
    commit(next);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveWord(String(event.active.id));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveWord(null);
    if (!over) return;
    const word = String(active.id);
    const overId = String(over.id);
    if (overId === POOL) returnWord(word);
    else if (overId.startsWith("slot:")) placeWord(word, Number(overId.slice("slot:".length)));
  }

  function tapBankWord(word: string) {
    setSelected((current) => (current === word ? null : word));
  }

  function tapBlank(index: number) {
    if (selected) placeWord(selected, index);
    else if (slots[index]) returnWord(slots[index]);
  }

  const bank = order.filter((word) => !slots.includes(word));
  const allFilled = slots.every(Boolean);
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
            You filled all {answers.length} blanks correctly in{" "}
            <span className="font-bold text-blue-900">
              {formatDuration(finishedMs ?? 0)}
            </span>
            . Well done! 🙌
          </p>

          <button
            type="button"
            onClick={resetRun}
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
      <div ref={playAreaRef} className="scroll-mt-[6.25rem] flex items-center justify-between mb-2 sm:mb-4">
        <p className="text-sm sm:text-base text-gray-600">
          Go, <span className="font-semibold text-blue-900">{name}</span>!
        </p>
        <p className="font-mono text-base sm:text-lg font-bold text-blue-900">
          ⏱ {formatDuration(elapsedMs)}
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        // Off on phones: the tray sits at the bottom edge, so with auto-scroll
        // on, picking up a word from it would scroll the page by itself. On
        // desktop the default zone (outer 20% of the window) covers the upper
        // sentences and made the page creep upward, so use a thin, gentle one.
        autoScroll={isCompact ? false : { threshold: { x: 0.1, y: 0.07 }, acceleration: 5 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-4 lg:gap-8 items-start">
          {/* Phones: a tray pinned to the bottom of the screen, so the words and
              the blanks are always on screen together. Wide screens: a sticky
              side panel. The heading doubles as the "word selected" reminder. */}
          <div
            ref={trayRef}
            className="fixed inset-x-0 bottom-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-6px_16px_rgba(15,23,42,0.10)] lg:static lg:z-auto lg:order-2 lg:sticky lg:top-28 lg:border-0 lg:bg-transparent lg:backdrop-blur-none lg:p-0 lg:shadow-none"
          >
            <h3 className="font-bold text-blue-900 mb-1 lg:mb-3 text-center text-sm lg:text-base">
              {selected ? (
                <span className="text-blue-700">&ldquo;{selected}&rdquo; selected — tap a blank</span>
              ) : telugu ? (
                "పదాలు"
              ) : (
                "Words"
              )}
            </h3>
            <WordBank
              words={bank}
              selected={selected}
              onTap={tapBankWord}
              dragging={!!activeWord}
              emptyText={telugu ? "అన్ని పదాలు ఉంచబడ్డాయి." : "All words are placed."}
            />
          </div>

          <div className="lg:order-1">
            <ol className="flex flex-col gap-1 sm:gap-1.5">
              {sentences.map((sentence, si) => {
                const parts = sentence.text.split(BLANK);
                // Punctuation right after a blank stays glued to it, so a full stop
                // never wraps onto a line of its own.
                const trailing = parts.map((_, pi) =>
                  pi < parts.length - 1 ? (parts[pi + 1].match(/^[.,;:!?]+/)?.[0] ?? "") : ""
                );
                return (
                  <li
                    key={si}
                    className="flex gap-2 sm:gap-3 bg-white rounded-xl border border-gray-100 shadow-sm px-2.5 sm:px-4 py-1"
                  >
                    <span className="shrink-0 flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 mt-[0.65rem] sm:mt-2 rounded-full bg-blue-900 text-white text-[11px] sm:text-xs font-bold">
                      {si + 1}
                    </span>
                    <p className="text-[17px] sm:text-xl text-gray-900 leading-[2.6rem] sm:leading-[2.5rem]">
                      {parts.map((part, pi) => {
                        const index = firstSlot[si] + pi;
                        return (
                          <Fragment key={pi}>
                            {pi > 0 ? part.slice(trailing[pi - 1].length) : part}
                            {pi < parts.length - 1 && (
                              <span className="whitespace-nowrap">
                                <Blank
                                  index={index}
                                  word={slots[index]}
                                  pending={!!selected}
                                  onTap={() => tapBlank(index)}
                                />
                                {trailing[pi]}
                              </span>
                            )}
                          </Fragment>
                        );
                      })}
                    </p>
                  </li>
                );
              })}
            </ol>

            {allFilled && (
              <p className="text-center text-sm font-medium text-amber-800 bg-amber-50 border border-amber-200 rounded-lg py-2 px-3 mt-3">
                Every blank is filled, but some words are in the wrong place — keep trying!
              </p>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeWord ? (
            <div className="rounded-full border border-blue-400 bg-white px-4 py-2 shadow-lg text-base sm:text-lg font-medium text-gray-900">
              {activeWord}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <div className="flex justify-center mt-4 sm:mt-8">
        <button
          type="button"
          onClick={resetRun}
          className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border border-gray-300 text-sm sm:text-base text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          <RotateCcw size={16} />
          Start Over
        </button>
      </div>

      <div className="lg:hidden" style={{ height: trayHeight }} aria-hidden />
    </div>
  );
}
