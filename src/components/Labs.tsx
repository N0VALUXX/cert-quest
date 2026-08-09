import { useMemo, useState } from "react";
import type { CertPack, Exercise, ExerciseItem, Visual as VisualModel } from "../content-model";
import { Visual } from "./Visual";

interface Props {
  readonly packs: readonly CertPack[];
  readonly activePackId: string;
  readonly onExit: () => void;
}

interface LabEntry {
  readonly pack: CertPack;
  readonly exercise: Exercise;
}

export function Labs({ packs, activePackId, onExit }: Props) {
  const labs = useMemo<readonly LabEntry[]>(() => packs.flatMap((pack) => (pack.exercises ?? []).map((exercise) => ({ pack, exercise }))), [packs]);
  const preferred = labs.findIndex((entry) => entry.pack.id === activePackId);
  const [selectedId, setSelectedId] = useState(() => labs[Math.max(0, preferred)]?.exercise.id ?? "");
  const selected = labs.find((entry) => entry.exercise.id === selectedId);

  return (
    <div className="labs-shell">
      <aside className="labs-index">
        <div className="brand"><span className="brand-mark">CQ</span><div><strong>FIELD LABS</strong><small>Apply, don’t recite.</small></div></div>
        <button className="back-link" onClick={onExit}>← Mission control</button>
        <p className="labs-label">AVAILABLE SCENARIOS</p>
        {labs.map((entry, index) => (
          <button className={`lab-index-item ${entry.exercise.id === selectedId ? "is-active" : ""}`} onClick={() => setSelectedId(entry.exercise.id)} key={entry.exercise.id}>
            <span>{String(index + 1).padStart(2, "0")}</span><div><strong>{entry.exercise.title}</strong><small>{entry.pack.name} · {formatType(entry.exercise.type)}</small></div>
          </button>
        ))}
      </aside>
      <main className="lab-main">
        {selected === undefined ? (
          <section className="empty-lab"><p className="eyebrow">NO LABS FOUND</p><h1>The workbench is empty.</h1><button className="button button--primary" onClick={onExit}>Return to mission control</button></section>
        ) : <Lab key={selected.exercise.id} entry={selected} />}
      </main>
    </div>
  );
}

function Lab({ entry }: { readonly entry: LabEntry }) {
  const { exercise, pack } = entry;
  return (
    <article className="lab-workspace">
      <header className="lab-header"><div><p className="eyebrow">{pack.name} · {exercise.metadata.domain ?? "APPLIED PRACTICE"}</p><h1>{exercise.title}</h1><p>{exercise.learningObjective}</p></div><span className={`mode-chip mode-chip--${exercise.difficulty}`}>{exercise.difficulty}</span></header>
      <div className="lab-instruction"><span>MISSION</span><p>{exercise.instructions}</p></div>
      <ExerciseWorkspace exercise={exercise} />
    </article>
  );
}

function ExerciseWorkspace({ exercise }: { readonly exercise: Exercise }) {
  if (exercise.type === "categorization") return <Categorization exercise={exercise} />;
  if (exercise.type === "sequence") return <Sequence exercise={exercise} />;
  if (exercise.type === "matching") return <Matching exercise={exercise} />;
  if (exercise.type === "hotspot") return <Hotspot exercise={exercise} />;
  if (exercise.type === "label-diagram") return <LabelDiagram exercise={exercise} />;
  return <ChoiceExercise exercise={exercise} />;
}

function Result({ score, explanation, onReset }: { readonly score: number; readonly explanation: string; readonly onReset: () => void }) {
  return <section className={`lab-result ${score === 100 ? "is-perfect" : ""}`} aria-live="polite"><div><span>{score === 100 ? "✓" : "↗"}</span><div><p className="eyebrow">{score === 100 ? "ARCHITECTURE HOLDS" : "PARTIAL MODEL"}</p><h2>{score}% semantically complete</h2></div></div><p>{explanation}</p><button className="button button--ghost" onClick={onReset}>Try a clean run</button></section>;
}

type CatExercise = Extract<Exercise, { readonly type: "categorization" }>;
function Categorization({ exercise }: { readonly exercise: CatExercise }) {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const check = () => {
    const correct = exercise.content.items.filter((item) => (assignments[item.id] || null) === exercise.solution.assignments[item.id]).length;
    setScore(Math.round(100 * correct / exercise.content.items.length));
  };
  const reset = () => { setAssignments({}); setScore(null); };
  return <div className="lab-canvas"><div className="sorting-grid">{exercise.content.categories.map((category) => <section className="sort-zone" key={category.id}><header><strong>{category.label}</strong>{category.hint !== undefined && <small>{category.hint}</small>}</header>{exercise.content.items.map((item) => <label className={assignments[item.id] === category.id ? "sort-card is-here" : "sort-card"} key={item.id}><span>{item.label}</span><select value={assignments[item.id] ?? ""} onChange={(event) => setAssignments((current) => ({ ...current, [item.id]: event.target.value }))}><option value="">Unplaced</option>{exercise.content.categories.map((candidate) => <option value={candidate.id} key={candidate.id}>{candidate.label}</option>)}</select></label>)}</section>)}</div>{score === null ? <button className="button button--primary" onClick={check}>Validate model</button> : <Result score={score} explanation={exercise.explanation} onReset={reset} />}</div>;
}

type SequenceExercise = Extract<Exercise, { readonly type: "sequence" }>;
function Sequence({ exercise }: { readonly exercise: SequenceExercise }) {
  const [items, setItems] = useState(() => [...exercise.content.items]);
  const [score, setScore] = useState<number | null>(null);
  const move = (from: number, delta: number) => setItems((current) => { const next = [...current]; const to = from + delta; if (to < 0 || to >= next.length) return current; [next[from], next[to]] = [next[to], next[from]]; return next; });
  const check = () => setScore(Math.round(100 * items.filter((item, index) => exercise.solution.order[index] === item.id).length / items.length));
  const reset = () => { setItems([...exercise.content.items]); setScore(null); };
  return <div className="lab-canvas"><ol className="sequence-list">{items.map((item, index) => <li key={item.id}><span>{index + 1}</span><div><strong>{item.label}</strong>{item.detail !== undefined && <small>{item.detail}</small>}</div><button onClick={() => move(index, -1)} disabled={index === 0} aria-label={`Move ${item.label} earlier`}>↑</button><button onClick={() => move(index, 1)} disabled={index === items.length - 1} aria-label={`Move ${item.label} later`}>↓</button></li>)}</ol>{score === null ? <button className="button button--primary" onClick={check}>Validate sequence</button> : <Result score={score} explanation={exercise.explanation} onReset={reset} />}</div>;
}

type MatchingExercise = Extract<Exercise, { readonly type: "matching" }>;
function Matching({ exercise }: { readonly exercise: MatchingExercise }) {
  const [pairs, setPairs] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const check = () => setScore(Math.round(100 * exercise.content.left.filter((item) => pairs[item.id] === exercise.solution.pairs[item.id]).length / exercise.content.left.length));
  return <div className="lab-canvas"><div className="matching-list">{exercise.content.left.map((item) => <label key={item.id}><strong>{item.label}</strong><select value={pairs[item.id] ?? ""} onChange={(event) => setPairs((current) => ({ ...current, [item.id]: event.target.value }))}><option value="">Choose a match</option>{exercise.content.right.map((right) => <option value={right.id} key={right.id}>{right.label}</option>)}</select></label>)}</div>{score === null ? <button className="button button--primary" onClick={check}>Validate matches</button> : <Result score={score} explanation={exercise.explanation} onReset={() => { setPairs({}); setScore(null); }} />}</div>;
}

type HotspotExercise = Extract<Exercise, { readonly type: "hotspot" }>;
function Hotspot({ exercise }: { readonly exercise: HotspotExercise }) {
  const entries = visualEntries(exercise.content.figure);
  const [selected, setSelected] = useState<readonly number[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const toggle = (index: number) => setSelected((current) => current.includes(index) ? current.filter((value) => value !== index) : [...current, index]);
  const check = () => setScore(Math.round(100 * exercise.solution.targets.filter((target) => selected.includes(target)).length / exercise.solution.targets.length));
  return <div className="lab-canvas"><p className="hotspot-prompt">{exercise.content.prompt}</p><div className="hotspot-grid">{entries.map((entry, index) => <button className={selected.includes(index) ? "is-selected" : ""} onClick={() => toggle(index)} key={`${entry.label}-${index}`}><span>{String(index + 1).padStart(2, "0")}</span><strong>{entry.label}</strong><p>{entry.body}</p></button>)}</div>{score === null ? <button className="button button--primary" onClick={check}>Validate selection</button> : <Result score={score} explanation={exercise.explanation} onReset={() => { setSelected([]); setScore(null); }} />}</div>;
}

type LabelExercise = Extract<Exercise, { readonly type: "label-diagram" }>;
function LabelDiagram({ exercise }: { readonly exercise: LabelExercise }) {
  const entries = visualEntries(exercise.content.figure);
  const [placements, setPlacements] = useState<Record<string, string>>({});
  const [score, setScore] = useState<number | null>(null);
  const check = () => setScore(Math.round(100 * exercise.content.slots.filter((slot) => placements[slot.id] === exercise.solution.placements[slot.id]).length / exercise.content.slots.length));
  return <div className="lab-canvas"><div className="diagram-label-grid">{exercise.content.slots.map((slot) => { const entry = entries[slot.elementIndex]; return <label key={slot.id}><span>{entry?.label ?? `Position ${slot.elementIndex + 1}`}</span><p>{entry?.body}</p><select value={placements[slot.id] ?? ""} onChange={(event) => setPlacements((current) => ({ ...current, [slot.id]: event.target.value }))}><option value="">Choose a label</option>{exercise.content.bank.map((item) => <option value={item.id} key={item.id}>{item.label}</option>)}</select></label>; })}</div>{score === null ? <button className="button button--primary" onClick={check}>Validate labels</button> : <Result score={score} explanation={exercise.explanation} onReset={() => { setPlacements({}); setScore(null); }} />}</div>;
}

type ChoiceKind = Extract<Exercise, { readonly type: "multiple-choice" | "multi-select" | "true-false" }>;
function ChoiceExercise({ exercise }: { readonly exercise: ChoiceKind }) {
  const [selected, setSelected] = useState<readonly string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const choices: readonly ExerciseItem[] = exercise.type === "true-false" ? [{ id: "true", label: "True" }, { id: "false", label: "False" }] : exercise.content.options;
  const prompt = exercise.type === "true-false" ? exercise.content.statement : exercise.content.prompt;
  const expected = exercise.type === "multiple-choice" ? [exercise.solution.correct] : exercise.type === "multi-select" ? exercise.solution.correct : [String(exercise.solution.correct)];
  const toggle = (id: string) => setSelected((current) => exercise.type === "multi-select" ? current.includes(id) ? current.filter((value) => value !== id) : [...current, id] : [id]);
  const check = () => setScore(expected.length === selected.length && expected.every((id) => selected.includes(id)) ? 100 : 0);
  return <div className="lab-canvas"><h2 className="choice-prompt">{prompt}</h2>{"figure" in exercise.content && exercise.content.figure !== undefined && <Visual model={exercise.content.figure} />}<div className="lab-choice-list">{choices.map((choice) => <button className={selected.includes(choice.id) ? "is-selected" : ""} onClick={() => toggle(choice.id)} key={choice.id}><span />{choice.label}</button>)}</div>{score === null ? <button className="button button--primary" onClick={check}>Validate decision</button> : <Result score={score} explanation={exercise.explanation} onReset={() => { setSelected([]); setScore(null); }} />}</div>;
}

function visualEntries(model: VisualModel): readonly { readonly label: string; readonly body: string }[] {
  if (model.kind === "steps") return model.steps;
  if (model.kind === "cycle") return model.stages;
  if (model.kind === "ladder") return model.rungs;
  if (model.kind === "nested") return model.layers;
  if (model.kind === "compare") return model.items;
  if (model.kind === "timeline") return model.points;
  if (model.kind === "matrix") return model.rows.map((row) => ({ label: row, body: model.cols.join(" · ") }));
  return model.outputs.map((output) => ({ label: output.label, body: output.note ?? model.expression }));
}

function formatType(type: Exercise["type"]): string {
  return type.replace(/-/g, " ");
}
