// Splits a string into user-perceived characters ("graphemes") rather than
// raw UTF-16 code units. Plain `.split("")` breaks scripts like Telugu or
// Hindi, where a base consonant and its combining vowel sign are separate
// code units but must render — and be treated — as a single letter.
export function graphemes(str: string): string[] {
  if (typeof Intl !== "undefined" && typeof Intl.Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(str), (s) => s.segment);
  }
  // Code-point aware (won't split a surrogate pair) but not combining-mark
  // aware; only used as a fallback for browsers without Intl.Segmenter.
  return Array.from(str);
}
