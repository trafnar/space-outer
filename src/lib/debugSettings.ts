import { useCallback, useSyncExternalStore } from "react";

export type RowAction = "expand" | "pop" | "sheet" | "none";

const ROW_ACTION_KEY = "debug:rowAction";
const DEFAULT_ROW_ACTION: RowAction = "pop";

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key === ROW_ACTION_KEY) callback();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function notifyAll() {
  listeners.forEach((l) => l());
}

function parseRowAction(raw: string | null): RowAction {
  if (
    raw === "expand" ||
    raw === "pop" ||
    raw === "sheet" ||
    raw === "none"
  ) {
    return raw;
  }
  return DEFAULT_ROW_ACTION;
}

export function useRowAction(): [RowAction, (value: RowAction) => void] {
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(ROW_ACTION_KEY);
  }, []);

  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const value = parseRowAction(raw);

  const setValue = useCallback((next: RowAction) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(ROW_ACTION_KEY, next);
    notifyAll();
  }, []);

  return [value, setValue];
}
