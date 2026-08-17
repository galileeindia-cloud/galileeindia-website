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
};

export default function PuzzleColumn({ id, title, items, emptyHint, children }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-blue-900 mb-3 text-center">{title}</h3>

      <div
        ref={setNodeRef}
        className={`min-h-[140px] rounded-2xl border-2 border-dashed p-4 flex flex-wrap content-start gap-2.5 transition ${
          isOver ? "border-blue-400 bg-blue-50" : "border-gray-200"
        }`}
      >
        <SortableContext items={items} strategy={rectSortingStrategy}>
          {items.length === 0 ? (
            <p className="w-full text-sm text-gray-400 text-center py-6">{emptyHint}</p>
          ) : (
            children
          )}
        </SortableContext>
      </div>
    </div>
  );
}
