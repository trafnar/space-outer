import { useLocalStorageStore } from "@/lib/useLocalStorageStore";

// Keep the legacy "reviewSheet:" localStorage prefix so existing saved
// selections survive the rename from "review sheet" to "worksheet".
const STORAGE_PREFIX = "reviewSheet:";

export function worksheetKey(slug: string) {
  return `${STORAGE_PREFIX}${slug}`;
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

function serialize(value: Set<number>): string {
  return JSON.stringify(Array.from(value));
}

type Updater = (prev: Set<number>) => Set<number>;

export function useWorksheet(
  slug: string,
): [Set<number>, (updater: Updater | Set<number>) => void] {
  const key = worksheetKey(slug);
  return useLocalStorageStore({
    key,
    prefix: STORAGE_PREFIX,
    parse,
    serialize,
  });
}
