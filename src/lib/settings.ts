import { createContext, useCallback, useContext } from "react";
import { useLocalStorageStore } from "@/lib/useLocalStorageStore";

const KEY_PREFIX = "spaceOuterSetting:";
const ROW_ACTION_KEY = `${KEY_PREFIX}rowAction`;
const SHOW_USER_ANSWER_KEY = `${KEY_PREFIX}showUserAnswer`;
const SHOW_CORRECT_ANSWER_KEY = `${KEY_PREFIX}showCorrectAnswer`;
const SHOW_HEADER_ROW_KEY = `${KEY_PREFIX}showHeaderRow`;
const SHOW_DEBUG_REGIONS_KEY = `${KEY_PREFIX}showDebugRegions`;
const SHOW_WORKSHEET_TITLE_KEY = `${KEY_PREFIX}showWorksheetTitle`;

function useSetting<T>(
  key: string,
  parse: (raw: string | null) => T,
): [T, (value: T) => void] {
  const [value, setStoredValue] = useLocalStorageStore({
    key,
    prefix: KEY_PREFIX,
    parse,
    serialize: String,
  });
  const setValue = useCallback((next: T) => setStoredValue(next), [
    setStoredValue,
  ]);

  return [value, setValue];
}

/* Row action (debug) */

export type RowAction = "expand" | "pop" | "sheet" | "none";

const DEFAULT_ROW_ACTION: RowAction = "sheet";

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

/**
 * Scoped + defaulted answer visibility. Each scope (e.g. `test:foo`,
 * `worksheet:foo`) is persisted independently and can default to
 * shown or hidden.
 */
export function useScopedAnswerVisibility(
  scope: string,
  defaultShow: boolean,
): AnswerVisibility {
  const parse = defaultShow ? parseBoolTrueDefault : parseBoolFalseDefault;
  const [showUserAnswer, setShowUserAnswer] = useSetting(
    `${SHOW_USER_ANSWER_KEY}:${scope}`,
    parse,
  );
  const [showCorrectAnswer, setShowCorrectAnswer] = useSetting(
    `${SHOW_CORRECT_ANSWER_KEY}:${scope}`,
    parse,
  );
  return {
    showUserAnswer,
    showCorrectAnswer,
    setShowUserAnswer,
    setShowCorrectAnswer,
  };
}

const AnswerVisibilityContext = createContext<AnswerVisibility | null>(null);

export const AnswerVisibilityProvider = AnswerVisibilityContext.Provider;

export function useAnswerVisibility(): AnswerVisibility {
  const ctx = useContext(AnswerVisibilityContext);
  if (!ctx) {
    throw new Error(
      "useAnswerVisibility must be used inside an AnswerVisibilityProvider",
    );
  }
  return ctx;
}

/* Show table header row (debug) */

export function useShowHeaderRow() {
  return useSetting(SHOW_HEADER_ROW_KEY, parseBoolFalseDefault);
}

/* Show debug regions (debug) */

export function useShowDebugRegions() {
  return useSetting(SHOW_DEBUG_REGIONS_KEY, parseBoolFalseDefault);
}

/* Worksheet page title visibility */

export function useShowWorksheetTitle() {
  return useSetting(SHOW_WORKSHEET_TITLE_KEY, parseBoolTrueDefault);
}
