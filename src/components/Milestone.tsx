import { useEffect, useRef } from "react";
import type { Milestone as M } from "../lib/store";

/**
 * The replacement for coin dopamine: a domain crossing the clear threshold is
 * a real statement about competence, so it gets the one interruption in the
 * app. Dismisses on click, Escape, or Enter.
 */
export function MilestoneToast({ milestone, onDismiss }: { milestone: M; onDismiss: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" || e.key === "Enter") {
        e.preventDefault();
        onDismiss();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onDismiss]);

  return (
    <div className="milestone-wrap" role="status" aria-live="polite">
      <div className="milestone">
        <div className="milestone-mark" aria-hidden>
          ✓
        </div>
        <div className="milestone-body">
          <div className="eyebrow">Domain cleared</div>
          <b>{milestone.domain}</b>
          <p>
            {milestone.packName} — you are at 80% readiness across this domain. That is the bar that
            actually matters.
          </p>
        </div>
        <button ref={closeRef} className="btn primary" onClick={onDismiss}>
          Keep going
        </button>
      </div>
    </div>
  );
}
