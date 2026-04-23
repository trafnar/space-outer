import { useCallback, useMemo, useSyncExternalStore } from "react";

// Keep the legacy "reviewSheet:" localStorage prefix so existing saved
// selections survive the rename from "review sheet" to "worksheet".
const STORAGE_PREFIX = "reviewSheet:";

export function worksheetKey(slug: string) {
  return `${STORAGE_PREFIX}${slug}`;
}

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(STORAGE_PREFIX)) callback();
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

function parse(raw: string | null): Set<number> {
  if (!raw) return new Set();
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((x): x is number => typeof x === "number"));
  } catch {
    return new Set();
  }
}

type Updater = (prev: Set<number>) => Set<number>;

export function useWorksheet(
  slug: string,
): [Set<number>, (updater: Updater | Set<number>) => void] {
  const key = worksheetKey(slug);

  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  }, [key]);

  const getServerSnapshot = useCallback(() => null, []);

  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const value = useMemo(() => parse(raw), [raw]);

  const setValue = useCallback(
    (updater: Updater | Set<number>) => {
      if (typeof window === "undefined") return;
      const current = parse(window.localStorage.getItem(key));
      const next = typeof updater === "function" ? updater(current) : updater;
      window.localStorage.setItem(key, JSON.stringify(Array.from(next)));
      notifyAll();
    },
    [key],
  );

  return [value, setValue];
}
