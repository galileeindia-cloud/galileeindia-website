"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, rectSortingStrategy } from "@dnd-kit/sortable";
import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  items: string[];
  emptyHint: string;
  children: ReactNode;
  /** Fires when the empty area of the column itself is tapped (not an item) — used to drop a tap-selected item here when there are more than two containers to choose from. */
  onColumnTap?: () => void;
  /** Highlights the column as a pending drop target for a tap-selected item. */
  pending?: boolean;
  compact?: boolean;
  /** Smallest layout, for a pool pinned to the bottom of a phone screen:
   * small heading, no minimum height, tight padding (normal from sm up). */
  dense?: boolean;
};

export default function PuzzleColumn({
  id,
  title,
  items,
  emptyHint,
  children,
  onColumnTap,
  pending,
  compact,
  dense,
}: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-0">
      {title && (
        <h3
          className={`font-semibold text-blue-900 text-center ${dense ? "text-sm mb-1.5 sm:text-base sm:mb-3" : "mb-3"}`}
        >
          {title}
        </h3>
      )}

      <div
        ref={setNodeRef}
        onClick={onColumnTap}
        className={`${
          dense ? "sm:min-h-[90px] p-2 gap-1.5 sm:p-4 sm:gap-2.5" : `${compact ? "min-h-[90px]" : "min-h-[140px]"} p-4 gap-2.5`
        } rounded-2xl border-2 border-dashed flex flex-wrap content-start transition ${
          isOver || pending ? "border-blue-400 bg-blue-50" : "border-gray-200"
        }`}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {items.length === 0 ? (
            <p className={`w-full text-sm text-gray-400 text-center ${dense ? "py-2 sm:py-6" : "py-6"}`}>{emptyHint}</p>
          ) : (
            children
          )}
        </SortableContext>
      </div>
    </div>
  );
}
