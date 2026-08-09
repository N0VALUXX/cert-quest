import { useMemo, useState } from "react";
import type { Exercise } from "../../types";
import { bestRotation, scoreOrder, shuffledFor } from "../../lib/exercises";
import { DiagramSurface, DraggableCard, DropZone, ExerciseToolbar, ProgressIndicator } from "./Primitives";

/**
 * Each exercise type owns its interaction and reports one thing back: how many
 * of its slots ended up correct. Everything else — scoring, hints, XP, the
 * explanation — is the runner's job, so adding a type never touches those.
 */
export interface TypeProps<E extends Exercise = Exercise> {
  ex: E;
  salt: number;
  /** Finalised: show marks, stop accepting input. */
  done: boolean;
  hintsLeft: number;
  onHint: () => void;
  /** A check that was not perfect, in a mode that allows another go. */
  onAttempt: () => void;
  onDone: (correct: number) => void;
}

const RETRIES_ALLOWED: Record<string, boolean> = { learn: true, practice: true };

/* ----------------------------- multiple choice ---------------------------- */

export function MultipleChoiceExercise({ ex, done, onDone }: TypeProps<Extract<Exercise, { type: "multiple-choice" }>>) {
  const [picked, setPicked] = useState<string | null>(null);
  const pick = (id: string) => {
    if (picked) return;
    setPicked(id);
    onDone(id === ex.solution.correct ? 1 : 0);
  };
  return (
    <div className="ex-options">
      {ex.content.options.map((o) => {
        let cls = "opt";
        if (picked || done) {
          if (o.id === ex.solution.correct) cls += " correct";
          else if (o.id === picked) cls += " chosen-wrong";
          else cls += " muted";
        }
        return (
          <button key={o.id} className={cls} disabled={!!picked || done} onClick={() => pick(o.id)}>
            <span className="key">{o.id}</span>
            <span>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TrueFalseExercise({ ex, done, onDone }: TypeProps<Extract<Exercise, { type: "true-false" }>>) {
  const [picked, setPicked] = useState<boolean | null>(null);
  const pick = (v: boolean) => {
    if (picked !== null) return;
    setPicked(v);
    onDone(v === ex.solution.correct ? 1 : 0);
  };
  return (
    <>
      <blockquote className="ex-body">{ex.content.statement}</blockquote>
      <div className="ex-options">
        {[true, false].map((v) => {
          let cls = "opt";
          if (picked !== null || done) {
            if (v === ex.solution.correct) cls += " correct";
            else if (v === picked) cls += " chosen-wrong";
            else cls += " muted";
          }
          return (
            <button key={String(v)} className={cls} disabled={picked !== null || done} onClick={() => pick(v)}>
              <span className="key">{v ? "T" : "F"}</span>
              <span>{v ? "True" : "False"}</span>
            </button>
          );
        })}
      </div>
    </>
  );
}

export function MultiSelectExercise({ ex, done, hintsLeft, onHint, onAttempt, onDone }: TypeProps<Extract<Exercise, { type: "multi-select" }>>) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [marked, setMarked] = useState(false);
  const correctSet = new Set(ex.solution.correct);

  const score = () =>
    ex.content.options.filter((o) => correctSet.has(o.id) === chosen.includes(o.id)).length;

  const check = () => {
    const c = score();
    setMarked(true);
    if (c === ex.content.options.length || !RETRIES_ALLOWED[ex.difficulty]) onDone(c);
    else onAttempt();
  };

  return (
    <>
      <div className="ex-options">
        {ex.content.options.map((o) => {
          const on = chosen.includes(o.id);
          let cls = "opt selectable";
          if (marked || done) {
            if (correctSet.has(o.id)) cls += " correct";
            else if (on) cls += " chosen-wrong";
            else cls += " muted";
          } else if (on) cls += " chosen";
          return (
            <button
              key={o.id}
              className={cls}
              disabled={marked || done}
              onClick={() => setChosen((p) => (on ? p.filter((x) => x !== o.id) : [...p, o.id]))}
              aria-pressed={on}
            >
              <span className="key">{on ? "✓" : ""}</span>
              <span>{o.label}</span>
            </button>
          );
        })}
      </div>
      {!done && (
        <ExerciseToolbar
          onCheck={marked ? () => { setMarked(false); } : check}
          checkLabel={marked ? "Try again" : "Check"}
          onReset={() => { setChosen([]); setMarked(false); }}
          onHint={onHint}
          canCheck={chosen.length > 0 || marked}
          hintsLeft={hintsLeft}
          checked={false}
        />
      )}
    </>
  );
}

/* --------------------------------- sequence ------------------------------- */

export function SequenceExercise({ ex, salt, done, hintsLeft, onHint, onAttempt, onDone }: TypeProps<Extract<Exercise, { type: "sequence" }>>) {
  const order = ex.solution.order;
  const items = ex.content.items;
  const indexOf = useMemo(() => new Map(items.map((it, i) => [it.id, i])), [items]);
  const correctIdx = useMemo(() => order.map((id) => indexOf.get(id)!), [order, indexOf]);

  const [arr, setArr] = useState(() => shuffledFor(ex.id, items.length, salt));
  const [marked, setMarked] = useState(false);

  // Compare against the intended sequence, not raw item order.
  const asPositions = arr.map((itemIdx) => correctIdx.indexOf(itemIdx));
  const correct = scoreOrder(asPositions, ex.solution.cyclic);
  const offset = bestRotation(asPositions, ex.solution.cyclic);

  const move = (pos: number, delta: number) => {
    if (marked || done) return;
    const t = pos + delta;
    if (t < 0 || t >= arr.length) return;
    const next = [...arr];
    [next[pos], next[t]] = [next[t], next[pos]];
    setArr(next);
  };

  const check = () => {
    setMarked(true);
    if (correct === arr.length || !RETRIES_ALLOWED[ex.difficulty]) onDone(correct);
    else onAttempt();
  };

  return (
    <>
      <ol className="order-list">
        {arr.map((itemIdx, pos) => {
          const item = items[itemIdx];
          const expected = (pos + offset) % arr.length;
          const right = asPositions[pos] === expected;
          const show = marked || done;
          return (
            <li key={item.id} className={`order-row${show ? (right ? " right" : " wrong") : ""}`}>
              <span className="order-n mono">{pos + 1}</span>
              <span className="order-main">
                <b>{item.label}</b>
                {show && item.detail && <span className="order-body">{item.detail}</span>}
              </span>
              {!show && (
                <span className="order-moves">
                  <button className="move-btn" onClick={() => move(pos, -1)} disabled={pos === 0} aria-label={`Move ${item.label} up`}>↑</button>
                  <button className="move-btn" onClick={() => move(pos, 1)} disabled={pos === arr.length - 1} aria-label={`Move ${item.label} down`}>↓</button>
                </span>
              )}
              {show && <span className="order-verdict mono">{right ? "✓" : `→ ${((asPositions[pos] - offset + arr.length) % arr.length) + 1}`}</span>}
            </li>
          );
        })}
      </ol>
      {!done && (
        <ExerciseToolbar
          onCheck={marked ? () => setMarked(false) : check}
          checkLabel={marked ? "Try again" : "Check order"}
          onReset={() => { setArr(shuffledFor(ex.id, items.length, salt + 1)); setMarked(false); }}
          onHint={onHint}
          canCheck
          hintsLeft={hintsLeft}
          checked={false}
        />
      )}
    </>
  );
}

/* ------------------------------ categorization ---------------------------- */

export function CategorizationExercise({ ex, salt, done, hintsLeft, onHint, onAttempt, onDone }: TypeProps<Extract<Exercise, { type: "categorization" }>>) {
  const items = ex.content.items;
  const bankOrder = useMemo(() => shuffledFor(ex.id, items.length, salt), [ex.id, items.length, salt]);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [held, setHeld] = useState<string | null>(null);
  const [marked, setMarked] = useState(false);

  const unplaced = bankOrder.map((i) => items[i]).filter((it) => !placed[it.id]);
  const correct = items.filter((it) => placed[it.id] === ex.solution.assignments[it.id]).length;

  const place = (categoryId: string) => {
    if (!held || marked || done) return;
    setPlaced((p) => ({ ...p, [held]: categoryId }));
    setHeld(null);
  };

  const check = () => {
    setMarked(true);
    if (correct === items.length || !RETRIES_ALLOWED[ex.difficulty]) onDone(correct);
    else onAttempt();
  };

  const show = marked || done;

  return (
    <>
      <div className="ex-bank">
        {unplaced.length === 0 ? (
          <span className="ex-bank-empty">All cards placed.</span>
        ) : (
          unplaced.map((it) => (
            <DraggableCard
              key={it.id}
              label={it.label}
              selected={held === it.id}
              onPick={() => setHeld(held === it.id ? null : it.id)}
              onDragStart={() => setHeld(it.id)}
            />
          ))
        )}
      </div>

      <div className="ex-zones">
        {ex.content.categories.map((cat) => (
          <DropZone
            key={cat.id}
            label={cat.label}
            hint={ex.difficulty === "learn" ? cat.hint : undefined}
            active={!!held}
            onDrop={() => place(cat.id)}
          >
            {items
              .filter((it) => placed[it.id] === cat.id)
              .map((it) => {
                const right = ex.solution.assignments[it.id] === cat.id;
                return (
                  <DraggableCard
                    key={it.id}
                    label={it.label}
                    detail={show ? it.detail : undefined}
                    state={show ? (right ? "right" : "wrong") : null}
                    placed
                    onPick={() => {
                      if (show) return;
                      setPlaced((p) => {
                        const n = { ...p };
                        delete n[it.id];
                        return n;
                      });
                    }}
                  />
                );
              })}
          </DropZone>
        ))}
      </div>

      {!done && (
        <>
          <ProgressIndicator done={Object.keys(placed).length} total={items.length} />
          <ExerciseToolbar
            onCheck={marked ? () => setMarked(false) : check}
            checkLabel={marked ? "Try again" : "Check"}
            onReset={() => { setPlaced({}); setHeld(null); setMarked(false); }}
            onHint={onHint}
            canCheck={Object.keys(placed).length === items.length || marked}
            hintsLeft={hintsLeft}
            checked={false}
          />
        </>
      )}
    </>
  );
}

/* --------------------------------- matching ------------------------------- */

export function MatchingExercise({ ex, salt, done, hintsLeft, onHint, onAttempt, onDone }: TypeProps<Extract<Exercise, { type: "matching" }>>) {
  const { left, right } = ex.content;
  const rightOrder = useMemo(() => shuffledFor(`${ex.id}:r`, right.length, salt), [ex.id, right.length, salt]);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [held, setHeld] = useState<string | null>(null);
  const [marked, setMarked] = useState(false);

  const correct = Object.entries(ex.solution.pairs).filter(([l, r]) => links[l] === r).length;
  const total = Object.keys(ex.solution.pairs).length;
  const show = marked || done;

  const connect = (rightId: string) => {
    if (!held || show) return;
    setLinks((p) => {
      const n: Record<string, string> = {};
      // One-to-one: dropping a right that is already taken moves it.
      for (const [l, r] of Object.entries(p)) if (r !== rightId && l !== held) n[l] = r;
      n[held] = rightId;
      return n;
    });
    setHeld(null);
  };

  const check = () => {
    setMarked(true);
    if (correct === total || !RETRIES_ALLOWED[ex.difficulty]) onDone(correct);
    else onAttempt();
  };

  const labelFor = (id: string) => right.find((r) => r.id === id)?.label ?? "";

  return (
    <>
      <div className="ex-match">
        <div className="ex-match-col">
          {left.map((l) => {
            const linked = links[l.id];
            const state = show ? (ex.solution.pairs[l.id] === linked ? "right" : "wrong") : null;
            return (
              <button
                key={l.id}
                className={`ex-match-item${held === l.id ? " selected" : ""}${state ? ` ${state}` : ""}`}
                onClick={() => !show && setHeld(held === l.id ? null : l.id)}
                aria-pressed={held === l.id}
              >
                <span className="ex-match-text">{l.label}</span>
                <span className="ex-match-link mono">
                  {linked ? `→ ${labelFor(linked)}` : "→ ?"}
                </span>
                {show && state === "wrong" && (
                  <span className="ex-match-fix mono">should be {labelFor(ex.solution.pairs[l.id])}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="ex-match-col right">
          {rightOrder.map((i) => {
            const r = right[i];
            const taken = Object.values(links).includes(r.id);
            return (
              <button
                key={r.id}
                className={`ex-match-target${taken ? " taken" : ""}${held ? " active" : ""}`}
                disabled={show}
                onClick={() => connect(r.id)}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {!done && (
        <>
          <ProgressIndicator done={Object.keys(links).length} total={total} />
          <ExerciseToolbar
            onCheck={marked ? () => setMarked(false) : check}
            checkLabel={marked ? "Try again" : "Check"}
            onReset={() => { setLinks({}); setHeld(null); setMarked(false); }}
            onHint={onHint}
            canCheck={Object.keys(links).length === total || marked}
            hintsLeft={hintsLeft}
            checked={false}
          />
        </>
      )}
    </>
  );
}

/* ------------------------------ label diagram ----------------------------- */

export function LabelDiagramExercise({ ex, salt, done, hintsLeft, onHint, onAttempt, onDone }: TypeProps<Extract<Exercise, { type: "label-diagram" }>>) {
  const bankOrder = useMemo(() => shuffledFor(`${ex.id}:b`, ex.content.bank.length, salt), [ex.id, ex.content.bank.length, salt]);
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [held, setHeld] = useState<string | null>(null);
  const [marked, setMarked] = useState(false);

  const slots = ex.content.slots;
  const correct = slots.filter((s) => placed[s.id] === ex.solution.placements[s.id]).length;
  const show = marked || done;

  const slotAt = (index: number) => slots.find((s) => s.elementIndex === index)?.id ?? null;
  const bankLabel = (id: string) => ex.content.bank.find((b) => b.id === id)?.label ?? null;

  const onElement = (index: number) => {
    const slotId = slotAt(index);
    if (!slotId || show) return;
    if (held) {
      setPlaced((p) => {
        const n: Record<string, string> = {};
        for (const [s, b] of Object.entries(p)) if (b !== held && s !== slotId) n[s] = b;
        n[slotId] = held;
        return n;
      });
      setHeld(null);
    } else if (placed[slotId]) {
      setPlaced((p) => {
        const n = { ...p };
        delete n[slotId];
        return n;
      });
    }
  };

  const marks: Record<number, "right" | "wrong"> = {};
  if (show) {
    for (const s of slots) {
      marks[s.elementIndex] = placed[s.id] === ex.solution.placements[s.id] ? "right" : "wrong";
    }
  }

  const used = new Set(Object.values(placed));

  const check = () => {
    setMarked(true);
    if (correct === slots.length || !RETRIES_ALLOWED[ex.difficulty]) onDone(correct);
    else onAttempt();
  };

  return (
    <>
      <div className="ex-bank">
        {bankOrder
          .map((i) => ex.content.bank[i])
          .filter((b) => !used.has(b.id))
          .map((b) => (
            <DraggableCard
              key={b.id}
              label={b.label}
              selected={held === b.id}
              onPick={() => setHeld(held === b.id ? null : b.id)}
              onDragStart={() => setHeld(b.id)}
            />
          ))}
        {used.size === ex.content.bank.length && <span className="ex-bank-empty">Word bank empty.</span>}
      </div>

      <DiagramSurface
        figure={ex.content.figure}
        mode="label"
        slotFor={slotAt}
        filledLabel={(slotId) => (placed[slotId] ? bankLabel(placed[slotId]) : null)}
        marks={show ? marks : undefined}
        onElement={onElement}
      />

      {show && (
        <div className="ex-answers mono">
          {slots.map((s) => (
            <span key={s.id} className={placed[s.id] === ex.solution.placements[s.id] ? "right" : "wrong"}>
              slot {s.elementIndex + 1}: {bankLabel(ex.solution.placements[s.id])}
            </span>
          ))}
        </div>
      )}

      {!done && (
        <>
          <ProgressIndicator done={Object.keys(placed).length} total={slots.length} />
          <ExerciseToolbar
            onCheck={marked ? () => setMarked(false) : check}
            checkLabel={marked ? "Try again" : "Check labels"}
            onReset={() => { setPlaced({}); setHeld(null); setMarked(false); }}
            onHint={onHint}
            canCheck={Object.keys(placed).length === slots.length || marked}
            hintsLeft={hintsLeft}
            checked={false}
          />
        </>
      )}
    </>
  );
}

/* --------------------------------- hotspot -------------------------------- */

export function HotspotExercise({ ex, done, onAttempt, onDone }: TypeProps<Extract<Exercise, { type: "hotspot" }>>) {
  const [picks, setPicks] = useState<number[]>([]);
  const targets = ex.solution.targets;
  const needed = targets.length;
  const finished = picks.filter((p) => targets.includes(p)).length === needed;

  const click = (index: number) => {
    if (finished || done || picks.includes(index)) return;
    const next = [...picks, index];
    setPicks(next);
    // Clicking the wrong part of the diagram is this type's wrong attempt.
    if (!targets.includes(index)) onAttempt();
    if (next.filter((p) => targets.includes(p)).length === needed) onDone(needed);
  };

  const marks: Record<number, "right" | "wrong"> = {};
  for (const p of picks) marks[p] = targets.includes(p) ? "right" : "wrong";
  if (done) for (const t of targets) marks[t] = "right";

  return (
    <>
      <p className="ex-prompt">{ex.content.prompt}</p>
      <DiagramSurface figure={ex.content.figure} mode="hotspot" marks={marks} onElement={click} />
      <p className="ex-score">
        {needed > 1
          ? `${picks.filter((p) => targets.includes(p)).length} of ${needed} found`
          : picks.length === 0
            ? "Click the diagram."
            : finished
              ? "Found it."
              : "Not that one — keep looking."}
      </p>
    </>
  );
}

/* -------------------------------- renderer -------------------------------- */

export function ExerciseRenderer(props: TypeProps) {
  const { ex } = props;
  switch (ex.type) {
    case "multiple-choice":
      return <MultipleChoiceExercise {...(props as TypeProps<typeof ex>)} ex={ex} />;
    case "multi-select":
      return <MultiSelectExercise {...(props as TypeProps<typeof ex>)} ex={ex} />;
    case "true-false":
      return <TrueFalseExercise {...(props as TypeProps<typeof ex>)} ex={ex} />;
    case "sequence":
      return <SequenceExercise {...(props as TypeProps<typeof ex>)} ex={ex} />;
    case "categorization":
      return <CategorizationExercise {...(props as TypeProps<typeof ex>)} ex={ex} />;
    case "matching":
      return <MatchingExercise {...(props as TypeProps<typeof ex>)} ex={ex} />;
    case "label-diagram":
      return <LabelDiagramExercise {...(props as TypeProps<typeof ex>)} ex={ex} />;
    case "hotspot":
      return <HotspotExercise {...(props as TypeProps<typeof ex>)} ex={ex} />;
  }
}
