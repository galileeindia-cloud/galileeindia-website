"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type Props = {
  id: string;
  label: string;
  onTap: () => void;
  index?: number;
  selected?: boolean;
};

export default function SortableItem({ id, label, onTap, index, selected }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={(e) => {
        e.stopPropagation();
        onTap();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onTap();
        }
      }}
      {...attributes}
      {...listeners}
      className={`touch-none select-none inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm sm:text-base font-medium text-gray-900 shadow-sm cursor-grab active:cursor-grabbing transition ${
        selected ? "border-blue-500 bg-blue-50 ring-2 ring-blue-300" : "border-gray-200 bg-white hover:border-blue-300"
      } ${isDragging ? "opacity-40" : ""}`}
    >
      {typeof index === "number" && (
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-900 text-white text-xs font-bold shrink-0">
          {index + 1}
        </span>
      )}
      {label}
    </div>
  );
}
