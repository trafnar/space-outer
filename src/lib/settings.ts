import { useCallback, useSyncExternalStore } from "react";

const KEY_PREFIX = "spaceOuterSetting:";
const ROW_ACTION_KEY = `${KEY_PREFIX}rowAction`;
const SHOW_USER_ANSWER_KEY = `${KEY_PREFIX}showUserAnswer`;
const SHOW_CORRECT_ANSWER_KEY = `${KEY_PREFIX}showCorrectAnswer`;
const SHOW_HEADER_ROW_KEY = `${KEY_PREFIX}showHeaderRow`;
const SHOW_DEBUG_REGIONS_KEY = `${KEY_PREFIX}showDebugRegions`;
const SHOW_REVIEW_TITLE_KEY = `${KEY_PREFIX}showReviewTitle`;

const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(KEY_PREFIX)) callback();
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

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeRaw(key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
  notifyAll();
}

function useSetting<T>(
  key: string,
  parse: (raw: string | null) => T,
): [T, (value: T) => void] {
  const getSnapshot = useCallback(() => readRaw(key), [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const value = parse(raw);

  const setValue = useCallback(
    (next: T) => writeRaw(key, String(next)),
    [key],
  );

  return [value, setValue];
}

/* Row action (debug) */

export type RowAction = "expand" | "pop" | "sheet" | "none";

const DEFAULT_ROW_ACTION: RowAction = "pop";

function parseRowAction(raw: string | null): RowAction {
  if (raw === "expand" || raw === "pop" || raw === "sheet" || raw === "none") {
    return raw;
  }
  return DEFAULT_ROW_ACTION;
}

export function useRowAction() {
  return useSetting(ROW_ACTION_KEY, parseRowAction);
}

/* Answer visibility */

const parseBoolTrueDefault = (raw: string | null) => raw !== "false";
const parseBoolFalseDefault = (raw: string | null) => raw === "true";

export interface AnswerVisibility {
  showUserAnswer: boolean;
  showCorrectAnswer: boolean;
  setShowUserAnswer: (value: boolean) => void;
  setShowCorrectAnswer: (value: boolean) => void;
}

export function useAnswerVisibility(): AnswerVisibility {
  const [showUserAnswer, setShowUserAnswer] = useSetting(
    SHOW_USER_ANSWER_KEY,
    parseBoolTrueDefault,
  );
  const [showCorrectAnswer, setShowCorrectAnswer] = useSetting(
    SHOW_CORRECT_ANSWER_KEY,
    parseBoolTrueDefault,
  );
  return {
    showUserAnswer,
    showCorrectAnswer,
    setShowUserAnswer,
    setShowCorrectAnswer,
  };
}

/* Show table header row (debug) */

export function useShowHeaderRow() {
  return useSetting(SHOW_HEADER_ROW_KEY, parseBoolFalseDefault);
}

/* Show debug regions (debug) */

export function useShowDebugRegions() {
  return useSetting(SHOW_DEBUG_REGIONS_KEY, parseBoolFalseDefault);
}

/* Review page title visibility */

export function useShowReviewTitle() {
  return useSetting(SHOW_REVIEW_TITLE_KEY, parseBoolTrueDefault);
}
