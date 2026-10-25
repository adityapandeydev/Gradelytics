import { useEffect, useState } from "react";
import { calculate, prepareCalculation } from "./calculation-api";
import type {
  CalculationInput,
  CalculationKind,
  CalculationResults,
} from "./calculation-api";

export interface CalculationState<T> {
  phase: "idle" | "pending" | "verified" | "unavailable";
  data: T | null;
  error: string | null;
  retry: () => void;
}
export function useCalculation<K extends CalculationKind>(
  kind: K,
  input: CalculationInput,
  enabled = true,
): CalculationState<CalculationResults[K]> {
  const [revision, setRevision] = useState(0);
  let body = "",
    preparationError: string | null = null;
  try {
    body = prepareCalculation(kind, input);
  } catch (error) {
    preparationError =
      error instanceof Error ? error.message : "Check your grading settings.";
  }
  const key = `${kind}:${revision}:${body}`;
  const [snapshot, setSnapshot] = useState<{
    key: string;
    data: CalculationResults[K] | null;
    error: string | null;
  } | null>(null);
  useEffect(() => {
    if (!enabled || !body) return;
    const controller = new AbortController();
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const debounce = setTimeout(async () => {
      timeout = setTimeout(() => controller.abort(), 5000);
      try {
        const data = await calculate(kind, body, controller.signal);
        if (!cancelled) setSnapshot({ key, data, error: null });
      } catch (error) {
        if (!cancelled)
          setSnapshot({
            key,
            data: null,
            error: controller.signal.aborted
              ? "The live calculation timed out. Please try again."
              : error instanceof Error
                ? error.message
                : "Live calculations are unavailable.",
          });
      } finally {
        clearTimeout(timeout);
      }
    }, 120);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
      clearTimeout(timeout);
      controller.abort();
    };
  }, [kind, body, key, enabled]);
  const retry = () => setRevision((previous) => previous + 1);
  if (!enabled) return { phase: "idle", data: null, error: null, retry };
  if (preparationError)
    return { phase: "unavailable", data: null, error: preparationError, retry };
  // A response belongs only to its exact inputs, never a subsequent grade or scale.
  if (snapshot?.key !== key)
    return { phase: "pending", data: null, error: null, retry };
  return {
    phase: snapshot.error ? "unavailable" : "verified",
    data: snapshot.data,
    error: snapshot.error,
    retry,
  };
}
