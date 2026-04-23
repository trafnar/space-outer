import type React from "react";

// Paint a Set<T> by dragging vertically across rows. Mousedown on an
// "anchor" toggles that row and captures the resulting state as the
// drag target. As the cursor moves, every row whose rect intersects
// [min(startY, currentY), max(startY, currentY)] is set to target;
// rows that drop out of that range revert to their state at drag
// start. X position is irrelevant — only Y matters.
//
// Rows are found via `selector` (defaults to `[data-brush-id]`) and
// keyed via `parseId`. The attribute carrying the id is the caller's
// choice — just put `data-brush-id={id}` (or equivalent) on each row
// and point `parseId` at it.
//
// Returns a pointerdown handler to wire onto the anchor element
// (typically a per-row toggle button). A click swallower is installed
// on pointerup to prevent the natural click from re-toggling or
// activating anything underneath.
export function useBrushSelect<T>({
  current,
  setState,
  selector = "[data-brush-id]",
  parseId = (el) => el.dataset.brushId as unknown as T,
}: {
  current: Set<T>;
  setState: React.Dispatch<React.SetStateAction<Set<T>>>;
  selector?: string;
  parseId?: (el: HTMLElement) => T;
}) {
  return (
    e: React.PointerEvent<HTMLElement>,
    id: T,
    currentlyOn: boolean,
  ) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    e.preventDefault();
    e.stopPropagation();

    const target = !currentlyOn;
    setState((prev) => {
      if (prev.has(id) === target) return prev;
      const next = new Set(prev);
      if (target) next.add(id);
      else next.delete(id);
      return next;
    });

    // Snapshot the state from this render. React state is immutable —
    // setState produces a new Set, so this reference stays frozen at
    // drag-start state. Outside-range rows revert to this snapshot.
    const originals = current;
    const startY = e.clientY;
    const rows = [...document.querySelectorAll<HTMLElement>(selector)];

    const onMove = (ev: PointerEvent) => {
      const lo = Math.min(startY, ev.clientY);
      const hi = Math.max(startY, ev.clientY);
      setState((prev) => {
        const next = new Set(prev);
        let changed = false;
        for (const row of rows) {
          const rid = parseId(row);
          const rect = row.getBoundingClientRect();
          const inRange = rect.bottom >= lo && rect.top <= hi;
          const desired = inRange ? target : originals.has(rid);
          if (next.has(rid) !== desired) {
            if (desired) next.add(rid);
            else next.delete(rid);
            changed = true;
          }
        }
        return changed ? next : prev;
      });
    };

    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      // Swallow the click that naturally follows pointerup so it
      // doesn't re-toggle the button (drag ended on same button) or
      // activate a row (drag ended on a row cell). A short timeout
      // cleans up in case no click actually fires.
      const swallow = (ev: MouseEvent) => {
        ev.stopPropagation();
        ev.preventDefault();
        window.removeEventListener("click", swallow, true);
      };
      window.addEventListener("click", swallow, { capture: true });
      setTimeout(() => {
        window.removeEventListener("click", swallow, true);
      }, 150);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };
}
