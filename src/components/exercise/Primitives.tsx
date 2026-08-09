import { useState, type ReactNode } from "react";
import type { Visual } from "../../types";
import { elementsOf } from "../../lib/exercises";

/**
 * Shared interaction primitives. Every exercise type composes these rather
 * than reimplementing dragging, drop targets, hints and feedback.
 *
 * Interaction model: click-to-pick then click-to-place is the primary path,
 * because it works identically with mouse, touch and keyboard. HTML5 drag is
 * layered on top for people who expect to drag. Both drive the same state, so
 * neither is a second-class route.
 */

/* -------------------------------- toolbar --------------------------------- */

export function ExerciseToolbar({
  onCheck,
  onReset,
  onHint,
  checkLabel = "Check",
  canCheck,
  hintsLeft,
  checked,
}: {
  onCheck: () => void;
  onReset: () => void;
  onHint: () => void;
  checkLabel?: string;
  canCheck: boolean;
  hintsLeft: number;
  checked: boolean;
}) {
  return (
    <div className="ex-toolbar">
      {!checked && (
        <button className="btn primary" onClick={onCheck} disabled={!canCheck}>
          {checkLabel}
        </button>
      )}
      {!checked && (
        <button className="btn ghost" onClick={onReset}>
          Reset
        </button>
      )}
      {!checked && hintsLeft > 0 && (
        <button className="btn ghost" onClick={onHint}>
          Hint ({hintsLeft})
        </button>
      )}
    </div>
  );
}

export function ProgressIndicator({ done, total }: { done: number; total: number }) {
  return (
    <span className="ex-progress mono">
      {done} / {total} placed
    </span>
  );
}

export function HintPanel({ hints }: { hints: string[] }) {
  if (hints.length === 0) return null;
  return (
    <div className="panel warn ex-hints">
      <h4>{hints.length === 1 ? "Hint" : "Hints"}</h4>
      {hints.map((h, i) => (
        <p key={i}>{h}</p>
      ))}
    </div>
  );
}

/**
 * Feedback never just says WRONG. It says what is right, what is not, and
 * where to look — the nudge matters more than the verdict.
 */
export function FeedbackPanel({
  correct,
  total,
  nudge,
  explanation,
}: {
  correct: number;
  total: number;
  nudge?: string;
  explanation: string;
}) {
  const perfect = correct === total;
  const none = correct === 0;
  return (
    <div className={`panel ${perfect ? "good" : none ? "bad" : "warn"} ex-feedback`}>
      <h4>{perfect ? "Correct" : none ? "Not yet" : "Almost"}</h4>
      <p>
        {correct} of {total} right.
        {nudge ? ` ${nudge}` : ""}
      </p>
      <p>{explanation}</p>
    </div>
  );
}

/* ------------------------------ pick and place ---------------------------- */

export function DraggableCard({
  label,
  detail,
  selected,
  placed,
  state,
  onPick,
  onDragStart,
}: {
  label: string;
  detail?: string;
  selected?: boolean;
  placed?: boolean;
  state?: "right" | "wrong" | null;
  onPick: () => void;
  onDragStart?: () => void;
}) {
  return (
    <button
      className={`ex-card${selected ? " selected" : ""}${placed ? " placed" : ""}${
        state ? ` ${state}` : ""
      }`}
      draggable={!placed && !state}
      onDragStart={onDragStart}
      onClick={onPick}
      aria-pressed={selected}
    >
      <span className="ex-card-label">{label}</span>
      {detail && <span className="ex-card-detail">{detail}</span>}
    </button>
  );
}

export function DropZone({
  label,
  hint,
  active,
  state,
  onDrop,
  children,
}: {
  label: string;
  hint?: string;
  /** True when the learner is holding something this zone can accept. */
  active?: boolean;
  state?: "right" | "wrong" | null;
  onDrop: () => void;
  children?: ReactNode;
}) {
  const [over, setOver] = useState(false);
  return (
    <div
      className={`ex-zone${active ? " active" : ""}${over ? " over" : ""}${state ? ` ${state}` : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        onDrop();
      }}
    >
      <button className="ex-zone-head" onClick={onDrop} aria-label={`Place into ${label}`}>
        <span className="ex-zone-label">{label}</span>
        {hint && <span className="ex-zone-hint">{hint}</span>}
      </button>
      <div className="ex-zone-body">{children}</div>
    </div>
  );
}

/* ------------------------------ diagram surface --------------------------- */

/**
 * Renders a `Visual` as an interactive answer surface. The diagram itself is
 * the thing being manipulated: elements can be blanked into slots, or made
 * clickable as hotspots.
 *
 * This deliberately does not use images. Every diagram in this app is data, so
 * its parts are addressable by index — which is what lets validation be
 * semantic rather than a pixel comparison.
 */
export function DiagramSurface({
  figure,
  mode,
  slotFor,
  filledLabel,
  selectedIndex,
  marks,
  onElement,
}: {
  figure: Visual;
  mode: "hotspot" | "label";
  /** For label mode: is this element index a blanked slot? */
  slotFor?: (index: number) => string | null;
  /** For label mode: what has been dropped into that slot, if anything. */
  filledLabel?: (slotId: string) => string | null;
  selectedIndex?: number | null;
  marks?: Record<number, "right" | "wrong">;
  onElement: (index: number) => void;
}) {
  const els = elementsOf(figure);
  if (!els) {
    return <div className="detail">This diagram type cannot be used as an answer surface yet.</div>;
  }

  const stacked = figure.kind === "nested";

  return (
    <div className={`ex-surface${stacked ? " stacked" : ""}`}>
      {figure.caption && <div className="visual-cap">{figure.caption}</div>}
      <div className="ex-surface-body">
        {els.map((el, i) => {
          const slotId = mode === "label" ? slotFor?.(i) ?? null : null;
          const filled = slotId ? filledLabel?.(slotId) ?? null : null;
          const mark = marks?.[i];
          const isSlot = slotId !== null;
          return (
            <button
              key={`${el.label}-${i}`}
              className={`ex-el${isSlot ? " slot" : ""}${filled ? " filled" : ""}${
                mark ? ` ${mark}` : ""
              }${selectedIndex === i ? " selected" : ""}`}
              style={stacked ? { marginLeft: i * 12 } : undefined}
              onClick={() => onElement(i)}
              onDragOver={(e) => isSlot && e.preventDefault()}
              onDrop={(e) => {
                if (!isSlot) return;
                e.preventDefault();
                onElement(i);
              }}
              aria-label={isSlot ? `Slot ${i + 1}` : el.label}
            >
              <span className="ex-el-label">
                {isSlot ? filled ?? "—" : el.label}
              </span>
              {mode === "label" && !isSlot && el.body && (
                <span className="ex-el-body">{el.body}</span>
              )}
              {mode === "label" && isSlot && <span className="ex-el-body">{el.body}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
