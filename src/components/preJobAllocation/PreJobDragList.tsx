"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ROW_HEIGHT_PX } from "@/components/preJobAllocation/PreJobBulkAssignRow";

interface DragState {
  index: number;
  startY: number;
  offsetY: number;
}

interface PreJobDragListProps {
  items: any[];
  onReorder: (items: any[]) => void;
  getItemKey: (item: any, index: number) => React.Key;
  renderRow: (item: any, isDragging: boolean) => React.ReactNode;
  maxHeight?: string;
}

export default function PreJobDragList({
  items,
  onReorder,
  getItemKey,
  renderRow,
  maxHeight = "50vh",
}: PreJobDragListProps) {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    const handleEl = target.closest("[data-drag-handle]");
    if (!handleEl) return;
    const rowEl = target.closest("[data-row-index]") as HTMLElement | null;
    if (!rowEl) return;

    const index = Number(rowEl.dataset.rowIndex);
    if (Number.isNaN(index)) return;

    e.preventDefault();
    setDragState({ index, startY: e.clientY, offsetY: 0 });
  }, []);

  useEffect(() => {
    if (!dragState) return;

    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const handleMove = (e: PointerEvent) => {
      setDragState((prev) => {
        if (!prev) return prev;

        const deltaY = e.clientY - prev.startY;
        const shift = Math.trunc(deltaY / ROW_HEIGHT_PX);

        if (shift !== 0) {
          const currentLength = itemsRef.current.length;
          const newIndex = Math.min(
            Math.max(prev.index + shift, 0),
            currentLength - 1,
          );

          if (newIndex !== prev.index) {
            const next = [...itemsRef.current];
            const [moved] = next.splice(prev.index, 1);
            next.splice(newIndex, 0, moved);
            onReorder(next);

            return {
              index: newIndex,
              startY: prev.startY + shift * ROW_HEIGHT_PX,
              offsetY: deltaY - shift * ROW_HEIGHT_PX,
            };
          }
        }

        return { ...prev, offsetY: deltaY };
      });
    };

    const handleUp = () => setDragState(null);

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    window.addEventListener("pointercancel", handleUp);

    return () => {
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
      window.removeEventListener("pointercancel", handleUp);
    };
  }, [!!dragState]);

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        width: "100%",
        minWidth: "900px",
        maxHeight,
        overflowY: "auto",
      }}
    >
      {items.map((item, index) => {
        const isDragging = dragState?.index === index;
        return (
          <div
            key={getItemKey(item, index)}
            data-row-index={index}
            style={{
              position: "relative",
              zIndex: isDragging ? 10 : 1,
              transform:
                isDragging && dragState
                  ? `translateY(${dragState.offsetY}px)`
                  : undefined,
              transition: isDragging ? "none" : "transform 150ms ease",
              boxShadow: isDragging
                ? "0 8px 24px rgba(0,0,0,0.15)"
                : undefined,
              background: isDragging ? "#EBF8FF" : undefined,
            }}
          >
            {renderRow(item, isDragging)}
          </div>
        );
      })}
    </div>
  );
}