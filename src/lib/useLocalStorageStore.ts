import { useCallback, useMemo, useSyncExternalStore } from "react";

type Listener = () => void;
type Updater<T> = T | ((prev: T) => T);

const listenersByPrefix = new Map<string, Set<Listener>>();

function listenersForPrefix(prefix: string): Set<Listener> {
  let listeners = listenersByPrefix.get(prefix);
  if (!listeners) {
    listeners = new Set();
    listenersByPrefix.set(prefix, listeners);
  }
  return listeners;
}

function subscribePrefix(prefix: string, callback: Listener) {
  const listeners = listenersForPrefix(prefix);
  listeners.add(callback);

  const onStorage = (e: StorageEvent) => {
    if (e.key === null || e.key.startsWith(prefix)) callback();
  };
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
  };
}

function notifyPrefix(prefix: string) {
  listenersForPrefix(prefix).forEach((listener) => listener());
}

function readRaw(key: string): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(key);
}

function writeRaw(prefix: string, key: string, value: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, value);
  notifyPrefix(prefix);
}

export function useLocalStorageStore<T>({
  key,
  prefix,
  parse,
  serialize,
}: {
  key: string;
  prefix: string;
  parse: (raw: string | null) => T;
  serialize: (value: T) => string;
}): [T, (updater: Updater<T>) => void] {
  const subscribe = useCallback(
    (callback: Listener) => subscribePrefix(prefix, callback),
    [prefix],
  );
  const getSnapshot = useCallback(() => readRaw(key), [key]);
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => null);
  const value = useMemo(() => parse(raw), [parse, raw]);

  const setValue = useCallback(
    (updater: Updater<T>) => {
      const current = parse(readRaw(key));
      const next = typeof updater === "function"
        ? (updater as (prev: T) => T)(current)
        : updater;
      writeRaw(prefix, key, serialize(next));
    },
    [key, parse, prefix, serialize],
  );

  return [value, setValue];
}
