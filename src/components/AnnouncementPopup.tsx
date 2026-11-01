"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { ANNOUNCEMENT } from "@/data/events";
import { todayIn, toIsoDay } from "@/lib/occasions";

const SEEN_KEY = `announcement-closed:${ANNOUNCEMENT.image}`;

// A poster shown over the homepage when someone opens the site. It closes
// only with its own button, and stays closed for the rest of the browser
// session so it doesn't reappear on every return to the homepage. It stops
// appearing by itself after ANNOUNCEMENT.until.
export default function AnnouncementPopup() {
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (toIsoDay(todayIn()) > ANNOUNCEMENT.until) return;
    if (sessionStorage.getItem(SEEN_KEY)) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setOpen(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    sessionStorage.setItem(SEEN_KEY, "1");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-3 sm:p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ANNOUNCEMENT.alt}
        className="flex flex-col w-full max-w-md max-h-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-pop-in"
      >
        {/* min-h-0 lets the poster shrink so the button always stays on screen. */}
        <div className="min-h-0 flex-1 overflow-y-auto">
          <Image
            src={ANNOUNCEMENT.image}
            alt={ANNOUNCEMENT.alt}
            width={1024}
            height={1536}
            sizes="(max-width: 480px) 100vw, 448px"
            priority
            className="w-full h-auto"
          />
        </div>
        <div className="p-3 border-t border-gray-200">
          <button
            ref={closeRef}
            type="button"
            onClick={close}
            className="w-full flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition"
          >
            <X size={18} />
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
