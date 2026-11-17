"use client";

import { useEffect } from "react";
import { Download } from "lucide-react";

/**
 * Opens the browser's print dialog, where "Save as PDF" turns the report
 * into a PDF file. It also opens once by itself when the report loads.
 */
export default function PrintReportButton() {
  useEffect(() => {
    const timer = setTimeout(() => window.print(), 400);
    return () => clearTimeout(timer);
  }, []);

  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
    >
      <Download size={16} />
      Save as PDF
    </button>
  );
}
