import { Check, CircleAlert, LoaderCircle, RotateCcw } from "lucide-react";
import type { CalculationState } from "../lib/useCalculation";

export function CalculationStatus({
  state,
}: {
  state: Pick<CalculationState<unknown>, "phase" | "error" | "retry">;
}) {
  if (state.phase === "idle") return null;
  return (
    <div className={`calculation-status calculation-${state.phase}`}>
      <span role="status" aria-live="polite">
        {state.phase === "verified" ? (
          <Check size={14} aria-hidden="true" />
        ) : state.phase === "pending" ? (
          <LoaderCircle
            className="calculation-spinner"
            size={14}
            aria-hidden="true"
          />
        ) : (
          <CircleAlert size={14} aria-hidden="true" />
        )}
        {state.phase === "verified"
          ? "Verified calculation"
          : state.phase === "pending"
            ? "Updating calculation · Local estimate shown"
            : "Live verification unavailable · Local estimate shown"}
      </span>
      {state.phase === "unavailable" && (
        <>
          <details>
            <summary>Details</summary>
            <p>{state.error}</p>
          </details>
          <button className="text-link" onClick={state.retry}>
            <RotateCcw size={13} aria-hidden="true" />
            Retry calculation
          </button>
        </>
      )}
    </div>
  );
}
