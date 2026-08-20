"use client";

import { useEffect } from "react";
import { RotateCcw } from "lucide-react";

export default function PuzzleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Bible puzzle crashed:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="text-2xl font-bold text-blue-900">Something went wrong</h1>
      <p className="text-gray-600 max-w-md">
        The puzzle hit an unexpected error. Your progress on this attempt was
        lost, but nothing else was affected — please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-900 text-white font-semibold hover:bg-blue-800 transition"
      >
        <RotateCcw size={18} />
        Try again
      </button>

      <p className="mt-6 max-w-lg text-xs text-gray-400 font-mono break-words">
        {error.message || "No error message available"}
        {error.digest ? ` (digest: ${error.digest})` : ""}
      </p>
    </div>
  );
}
