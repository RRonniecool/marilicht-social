"use client";

import { Reorder, useDragControls } from "framer-motion";
import { ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Drag-to-reorder list. Dragging starts from the handle only (so inputs
 * inside rows stay usable), and arrow buttons give keyboard users the same
 * control.
 */
export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
  className,
}: {
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, handle: ReactNode, index: number) => ReactNode;
  className?: string;
}) {
  return (
    <Reorder.Group axis="y" values={items} onReorder={onReorder} className={cn("space-y-2", className)}>
      {items.map((item, index) => (
        <SortableRow key={item.id} item={item} index={index} items={items} onReorder={onReorder} renderItem={renderItem} />
      ))}
    </Reorder.Group>
  );
}

function SortableRow<T extends { id: string }>({
  item,
  index,
  items,
  onReorder,
  renderItem,
}: {
  item: T;
  index: number;
  items: T[];
  onReorder: (items: T[]) => void;
  renderItem: (item: T, handle: ReactNode, index: number) => ReactNode;
}) {
  const controls = useDragControls();
  const move = (delta: number) => {
    const next = [...items];
    const target = index + delta;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    onReorder(next);
  };

  const handle = (
    <span className="group/handle flex shrink-0 items-center">
      <button
        type="button"
        onPointerDown={(e) => {
          e.preventDefault();
          controls.start(e);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            move(-1);
          }
          if (e.key === "ArrowDown") {
            e.preventDefault();
            move(1);
          }
        }}
        aria-label="Drag to reorder, or use the arrow keys"
        className="grid h-9 w-6 cursor-grab touch-none place-items-center rounded-sm text-faint transition hover:bg-ink/5 hover:text-ink-2 active:cursor-grabbing"
      >
        <GripVertical size={16} />
      </button>
      <span className="sr-only">
        <button type="button" onClick={() => move(-1)} disabled={index === 0}>
          <ArrowUp /> Move up
        </button>
        <button type="button" onClick={() => move(1)} disabled={index === items.length - 1}>
          <ArrowDown /> Move down
        </button>
      </span>
    </span>
  );

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={controls}
      className="relative list-none"
      whileDrag={{ scale: 1.015, boxShadow: "0 18px 40px -16px rgba(22,26,43,0.35)", zIndex: 20 }}
      transition={{ type: "spring", stiffness: 500, damping: 40 }}
      style={{ borderRadius: 12 }}
    >
      {renderItem(item, handle, index)}
    </Reorder.Item>
  );
}
