import { useEffect, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
export function useStoredState<T>(
  key: string,
  initial: T | (() => T),
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored !== null) return JSON.parse(stored) as T;
    } catch {
      /* Storage may be unavailable. */
    }
    return typeof initial === "function" ? (initial as () => T)() : initial;
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* Remain usable without browser storage. */
    }
  }, [key, value]);
  return [value, setValue];
}
