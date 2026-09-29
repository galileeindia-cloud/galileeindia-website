"use client";

import { useState } from "react";
import { BookOpen, X } from "lucide-react";
import BibleVerseLookup from "./BibleVerseLookup";

// A small floating widget, pinned to the bottom-right corner of every page,
// so verse lookup is available everywhere without needing its own nav entry
// or page — tap the button to open a compact panel above it.
export default function FloatingVerseLookup() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] max-w-sm max-h-[70vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-gray-200 animate-fade-in">
          <div className="sticky top-0 flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-white rounded-t-2xl">
            <p className="font-bold text-blue-900 text-sm">Bible Verse Lookup</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close Bible verse lookup"
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="p-4">
            <BibleVerseLookup />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label={open ? "Close Bible verse lookup" : "Open Bible verse lookup"}
        aria-expanded={open}
        className="fixed bottom-6 right-4 sm:right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-blue-900 text-white shadow-lg hover:bg-blue-800 transition"
      >
        {open ? <X size={20} /> : <BookOpen size={20} />}
        <span className="hidden sm:inline text-sm font-semibold whitespace-nowrap">
          Verse Lookup
        </span>
      </button>
    </>
  );
}
