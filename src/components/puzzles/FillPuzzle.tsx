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
import ScrollToResult from "./ScrollToResult";
import Leaderboard from "./Leaderboard";
import {
  fetchLeaderboard,
  submitScore,
  type LeaderboardEntry,
} from "@/services/leaderboardService";
import { formatDuration } from "@/utils/time";
import type { FillSentence } from "@/data/biblePuzzles";

type Phase = "name" | "playing" | "complete";
// Each answer is a tile, numbered by its own blank. Blanks hold tile numbers,
// so a word that appears twice gets two separate tiles.
type Slots = (number | null)[];

const NAME_STORAGE_KEY = "biblePuzzlePlayerName";
const POOL = "pool";
const BLANK = "___";
const slotId = (index: number) => `slot:${index}`;
const tileId = (tile: number) => `tile:${tile}`;

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

// `inBank`: tiles in the word tray are a little smaller on phones, so every
// word fits in the pinned tray without scrolling inside it.
const chipClass = (selected: boolean, dragging: boolean, inBank = false) =>
  `touch-none select-none inline-flex items-center rounded-full border ${
    inBank ? "px-2.5 py-1 text-sm" : "px-3 py-1.5 text-[15px]"
  } sm:px-3.5 sm:py-1 sm:text-lg font-medium text-gray-900 shadow-sm [-webkit-touch-callout:none] cursor-grab active:cursor-grabbing transition ${
    selected
      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300"
      : "border-gray-200 bg-white hover:border-blue-300"
  } ${dragging ? "opacity-40" : ""}`;

// A word that can be picked up. It is a span (not a div) because it sits inside
// a sentence paragraph. In the word bank a tap selects it; inside a blank the
// blank's own tap handler takes over (the click bubbles up to it).
function Chip({
  tile,
  word,
  selected = false,
  onTap,
  inBank = false,
}: {
  tile: number;
  word: string;
  selected?: boolean;
  onTap?: () => void;
  inBank?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: tileId(tile) });

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
      className={chipClass(selected, isDragging, inBank)}
    >
      {word}
    </span>
  );
}

function Blank({
  index,
  tile,
  word,
  pending,
  onTap,
}: {
  index: number;
  tile: number | null;
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
      {tile !== null && word && <Chip tile={tile} word={word} />}
    </span>
  );
}

function WordBank({ tiles, wordOf, selected, onTap, dragging, emptyText }: {
  tiles: number[];
  wordOf: (tile: number) => string;
  emptyText: string;
  selected: number | null;
  onTap: (tile: number) => void;
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
      {tiles.length === 0 ? (
        <p className="text-center text-sm lg:text-base text-gray-500 py-1 lg:py-2">{emptyText}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5 lg:gap-2 max-h-[40vh] overflow-y-auto lg:max-h-none lg:overflow-visible">
          {tiles.map((tile) => (
            <Chip key={tile} tile={tile} word={wordOf(tile)} selected={selected === tile} onTap={() => onTap(tile)} inBank />
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
  const [order, setOrder] = useState<number[]>(() => answers.map((_, i) => i));
  const [selected, setSelected] = useState<number | null>(null);
  const [activeTile, setActiveTile] = useState<number | null>(null);
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

  // Phones play full screen: two panes (verses on top, words pinned below)
  // and the page behind them must not scroll, or it drags the game around.
  const fullScreen = isCompact && phase === "playing";
  useEffect(() => {
    if (!fullScreen) return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = previous;
    };
  }, [fullScreen]);

  // Track the tray's height for --bottom-bar-h below.
  useEffect(() => {
    if (phase !== "playing") return;
    const tray = trayRef.current;
    if (!tray) return;
    const observer = new ResizeObserver(() => setTrayHeight(tray.offsetHeight));
    observer.observe(tray);
    return () => observer.disconnect();
  }, [phase]);

  // Publish the pinned tray's height as --bottom-bar-h so floating buttons
  // (Verse Lookup) sit just above it instead of covering words.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--bottom-bar-h", isCompact && phase === "playing" ? `${trayHeight}px` : "0px");
    return () => {
      root.style.removeProperty("--bottom-bar-h");
    };
  }, [isCompact, phase, trayHeight]);

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
    setOrder(shuffle(answers.map((_, i) => i)));
    setSelected(null);
    setActiveTile(null);
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

  // Tiles with the same word are interchangeable, so compare words, not tiles.
  const isSolved = (candidate: Slots) =>
    candidate.every((tile, i) => tile !== null && answers[tile] === answers[i]);

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

  function placeTile(tile: number, slotIndex: number) {
    const from = slots.indexOf(tile);
    if (from === slotIndex) return;
    const next = [...slots];
    // Dropping onto a filled blank sends that word back to the bank, or into
    // the blank this word just left when it was dragged from another blank.
    if (from !== -1) next[from] = next[slotIndex];
    next[slotIndex] = tile;
    commit(next);
  }

  function returnTile(tile: number) {
    const from = slots.indexOf(tile);
    if (from === -1) return;
    const next = [...slots];
    next[from] = null;
    commit(next);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveTile(Number(String(event.active.id).slice("tile:".length)));
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setActiveTile(null);
    if (!over) return;
    const tile = Number(String(active.id).slice("tile:".length));
    const overId = String(over.id);
    if (overId === POOL) returnTile(tile);
    else if (overId.startsWith("slot:")) placeTile(tile, Number(overId.slice("slot:".length)));
  }

  function tapBankTile(tile: number) {
    setSelected((current) => (current === tile ? null : tile));
  }

  function tapBlank(index: number) {
    const placed = slots[index];
    if (selected !== null) placeTile(selected, index);
    else if (placed !== null) returnTile(placed);
  }

  const bank = order.filter((tile) => !slots.includes(tile));
  const allFilled = slots.every((tile) => tile !== null);
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
        <ScrollToResult />
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

  const trayHeading = (
    <h3 className="font-bold text-blue-900 mb-1 lg:mb-3 text-center text-sm lg:text-base">
      {selected !== null ? (
        <span className="text-blue-700">&ldquo;{answers[selected]}&rdquo; selected — tap a blank</span>
      ) : telugu ? (
        "పదాలు"
      ) : (
        "Words"
      )}
    </h3>
  );
  const startOverLabel = "Start Over";

  return (
    // Phones: a full-screen layer with three rows -- a slim status bar, the
    // verses (the only part that scrolls) and the word tray, which never
    // moves. Wider screens: the page layout with a sticky side panel.
    <div className={fullScreen ? "fixed inset-0 z-50 flex flex-col bg-gray-50 h-[100dvh]" : undefined}>
      <div
        ref={playAreaRef}
        className={
          fullScreen
            ? "shrink-0 flex items-center justify-between gap-3 px-3 py-2 bg-white border-b border-gray-200 shadow-sm"
            : "flex items-center justify-between mb-2 sm:mb-4"
        }
      >
        <p className="text-sm sm:text-base text-gray-600 truncate">
          Go, <span className="font-semibold text-blue-900">{name}</span>!
        </p>
        <div className="flex items-center gap-3 shrink-0">
          <p className="font-mono text-base sm:text-lg font-bold text-blue-900">
            ⏱ {formatDuration(elapsedMs)}
          </p>
          {fullScreen && (
            <button
              type="button"
              onClick={resetRun}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700"
            >
              <RotateCcw size={14} />
              {startOverLabel}
            </button>
          )}
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        // Off on phones: the verses pane scrolls under a finger, and dragging
        // near the tray would scroll it by itself. On desktop the default zone
        // (outer 20% of the window) made the page creep upward, so use a thin,
        // gentle one.
        autoScroll={isCompact ? false : { threshold: { x: 0.1, y: 0.07 }, acceleration: 5 }}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div
          className={
            fullScreen
              ? "flex-1 min-h-0 flex flex-col"
              : "grid lg:grid-cols-[minmax(0,1fr)_20rem] gap-4 lg:gap-8 items-start"
          }
        >
          {/* The word tray. The heading doubles as the "word selected" reminder. */}
          <div
            ref={trayRef}
            className={
              fullScreen
                ? "order-2 shrink-0 border-t border-gray-200 bg-white px-3 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-6px_16px_rgba(15,23,42,0.10)]"
                : "lg:order-2 lg:sticky lg:top-28"
            }
          >
            {trayHeading}
            <WordBank
              tiles={bank}
              wordOf={(tile) => answers[tile]}
              selected={selected}
              onTap={tapBankTile}
              dragging={activeTile !== null}
              emptyText={telugu ? "అన్ని పదాలు ఉంచబడ్డాయి." : "All words are placed."}
            />
          </div>

          <div
            className={
              fullScreen ? "order-1 flex-1 min-h-0 overflow-y-auto overscroll-contain px-2.5 py-2" : "lg:order-1"
            }
          >
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
                                  tile={slots[index]}
                                  word={slots[index] === null ? null : answers[slots[index]]}
                                  pending={selected !== null}
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
          {activeTile !== null ? (
            <div className="rounded-full border border-blue-400 bg-white px-4 py-2 shadow-lg text-base sm:text-lg font-medium text-gray-900">
              {answers[activeTile]}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {!fullScreen && (
      <div className="flex justify-center mt-4 sm:mt-8">
        <button
          type="button"
          onClick={resetRun}
          className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg border border-gray-300 text-sm sm:text-base text-gray-700 font-semibold hover:bg-gray-50 transition"
        >
          <RotateCcw size={16} />
          {startOverLabel}
        </button>
      </div>
      )}
    </div>
  );
}
