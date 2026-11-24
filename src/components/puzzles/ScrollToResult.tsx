"use client";

import { useEffect, useRef } from "react";

/**
 * Put at the top of a puzzle's result card. A player usually finishes far
 * down a long puzzle, and the result card replaces it much higher up, so
 * without this they'd be left looking at the footer while the card (and the
 * leaderboard loading under it) moves the page about. Jumps instantly, so a
 * smooth scroll can't be thrown off by the leaderboard arriving mid-way.
 */
export default function ScrollToResult() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }, []);

  // scroll-mt clears the fixed site header.
  return <span ref={ref} aria-hidden className="block scroll-mt-28" />;
}
