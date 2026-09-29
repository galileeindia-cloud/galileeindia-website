"use client";

import { useRef, useState } from "react";
import { BookOpen, Loader2, X } from "lucide-react";

// Matches a complete "<book> <chapter>:<verse>[-<verse>]" reference, e.g.
// "john 3:16" or "1 corinthians 13:4-7" or "song of solomon 2:1" — but not
// a book name still being typed, so we don't fire lookups on every letter.
const REFERENCE_REGEX =
  /^([1-3]\s+)?[A-Za-z]+(?:\s+[A-Za-z]+)*\s+\d{1,3}:\d{1,3}(-\d{1,3})?$/;

type Verse = { reference: string; text: string; translation: string };
type Preview =
  | { status: "loading"; reference: string }
  | { status: "ready"; reference: string; text: string; translation: string }
  | { status: "error"; reference: string };

function normalize(reference: string) {
  return reference.trim().replace(/\s+/g, " ").toLowerCase();
}

export default function BibleVerseLookup() {
  const [text, setText] = useState("");
  const [preview, setPreview] = useState<Preview | null>(null);
  const [history, setHistory] = useState<(Verse & { id: number })[]>([]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cacheRef = useRef<Map<string, Verse>>(new Map());
  const requestIdRef = useRef(0);

  async function lookup(rawReference: string): Promise<Verse> {
    const key = normalize(rawReference);
    const cached = cacheRef.current.get(key);
    if (cached) return cached;

    const res = await fetch(
      `https://bible-api.com/${encodeURIComponent(rawReference)}?translation=kjv`
    );
    if (!res.ok) throw new Error("Verse not found");
    const data = await res.json();
    if (!data?.text) throw new Error("Verse not found");

    const verse: Verse = {
      reference: data.reference as string,
      text: (data.text as string).trim().replace(/\s*\n\s*/g, " "),
      translation: (data.translation_name as string) || "King James Version",
    };
    cacheRef.current.set(key, verse);
    return verse;
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setText(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = value.trim();
    if (!REFERENCE_REGEX.test(trimmed)) {
      setPreview(null);
      return;
    }

    setPreview({ status: "loading", reference: trimmed });
    const myRequestId = ++requestIdRef.current;
    debounceRef.current = setTimeout(() => {
      lookup(trimmed)
        .then((verse) => {
          if (requestIdRef.current !== myRequestId) return;
          setPreview({ status: "ready", ...verse });
        })
        .catch(() => {
          if (requestIdRef.current !== myRequestId) return;
          setPreview({ status: "error", reference: trimmed });
        });
    }, 300);
  }

  function commit(trimmed: string) {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setPreview({ status: "loading", reference: trimmed });
    const myRequestId = ++requestIdRef.current;
    lookup(trimmed)
      .then((verse) => {
        if (requestIdRef.current !== myRequestId) return;
        setHistory((prev) => [{ ...verse, id: Date.now() }, ...prev]);
        setPreview(null);
        setText("");
      })
      .catch(() => {
        if (requestIdRef.current !== myRequestId) return;
        setPreview({ status: "error", reference: trimmed });
      });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key !== " " && e.key !== "Enter") return;
    const trimmed = e.currentTarget.value.trim();
    if (!REFERENCE_REGEX.test(trimmed)) return;
    e.preventDefault();
    commit(trimmed);
  }

  function removeEntry(id: number) {
    setHistory((prev) => prev.filter((entry) => entry.id !== id));
  }

  return (
    <div>
      <label htmlFor="verse-lookup-input" className="sr-only">
        Bible reference
      </label>
      <div className="relative">
        <BookOpen
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />
        <input
          id="verse-lookup-input"
          type="text"
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="e.g. John 3:16"
          autoComplete="off"
          className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <p className="text-xs text-gray-500 mt-2">
        Press space or enter to reveal the verse.
      </p>

      {preview && (
        <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 p-3 animate-fade-in">
          {preview.status === "loading" && (
            <p className="flex items-center gap-2 text-blue-800 text-xs">
              <Loader2 size={14} className="animate-spin" />
              Looking up {preview.reference}&hellip;
            </p>
          )}
          {preview.status === "ready" && (
            <p className="text-blue-900 text-xs leading-relaxed line-clamp-3">
              <span className="font-semibold">{preview.reference}</span>
              {" — "}
              {preview.text}
            </p>
          )}
          {preview.status === "error" && (
            <p className="text-xs text-red-700">
              Couldn&rsquo;t find &ldquo;{preview.reference}&rdquo;. Check the spelling and
              try again.
            </p>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="mt-4 flex flex-col gap-3">
          {history.map((entry) => (
            <div
              key={entry.id}
              className="relative bg-gray-50 rounded-lg border border-gray-200 p-3"
            >
              <button
                type="button"
                onClick={() => removeEntry(entry.id)}
                aria-label={`Remove ${entry.reference}`}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>
              <p className="text-xs font-semibold tracking-wide text-blue-700 uppercase mb-1 pr-5">
                {entry.reference}
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">{entry.text}</p>
              <p className="text-[11px] text-gray-400 mt-2">{entry.translation}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
