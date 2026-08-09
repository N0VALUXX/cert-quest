import type {
  CertPack,
  Exercise,
  ExerciseItem,
  ExerciseType,
  Question,
  Visual,
} from "../types";
import { shuffle } from "./srs";

/**
 * Exercises come from two places and both produce the same `Exercise` shape,
 * so the renderer never needs to care which:
 *
 *   authored — written by hand in a pack's `exercises` array
 *   derived  — generated from the `visual` configs already attached to
 *              enrichments, which encode orderings, contrasts and grids
 *
 * Deriving means a new enrichment adds practice as well as explanation, at no
 * authoring cost. Nothing here is cert-specific; it reads generic structures.
 */

export const TYPE_LABEL: Record<ExerciseType, string> = {
  "multiple-choice": "Pick one",
  "multi-select": "Pick all that apply",
  "true-false": "True or false",
  matching: "Match the pairs",
  categorization: "Sort into groups",
  sequence: "Put in order",
  "label-diagram": "Label the diagram",
  hotspot: "Find it on the diagram",
};

/** Ordered, labelled elements of a diagram, for the kinds that have them. */
export function elementsOf(v: Visual): { label: string; body: string }[] | null {
  switch (v.kind) {
    case "steps":
      return v.steps.map((s) => ({ label: s.label, body: s.body }));
    case "ladder":
      return v.rungs.map((r) => ({ label: r.label, body: r.body }));
    case "nested":
      return v.layers.map((l) => ({ label: l.label, body: l.body }));
    case "cycle":
      return v.stages.map((s) => ({ label: s.label, body: s.body }));
    case "timeline":
      return [...v.points].sort((a, b) => a.at - b.at).map((p) => ({ label: p.label, body: p.body }));
    case "compare":
      return v.items.map((i) => ({ label: i.label, body: i.body }));
    default:
      return null;
  }
}

function sequencePrompt(v: Visual): string {
  switch (v.kind) {
    case "steps":
      return "Put these steps into the order they happen.";
    case "ladder":
      return "Rank these from first to last.";
    case "nested":
      return "Order these from the outermost layer inward.";
    case "timeline":
      return `Order these by when they engage, relative to: ${v.event}.`;
    case "cycle":
      return "Put the loop in order. Any starting point counts — the sequence is what matters.";
    default:
      return "Put these in order.";
  }
}

const slug = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40);

/* ------------------------------- derivation ------------------------------- */

function derivedFrom(pack: CertPack, q: Question, v: Visual): Exercise[] {
  const out: Exercise[] = [];
  const meta = { packId: pack.id, domain: q.domain, sourceQuestionId: q.id };
  const common = {
    difficulty: "practice" as const,
    metadata: meta,
    hints: [] as string[],
  };

  // Ordered structures become sequence puzzles.
  const els = elementsOf(v);
  if (els && v.kind !== "compare" && els.length >= 3) {
    const items: ExerciseItem[] = els.map((e, i) => ({
      id: `e${i}`,
      label: e.label,
      detail: e.body,
    }));
    out.push({
      ...common,
      id: `${q.id}:sequence`,
      type: "sequence",
      title: v.caption ?? "Put these in order",
      instructions: sequencePrompt(v),
      learningObjective: `Recall the ordering behind ${q.domain}.`,
      explanation: "Each step explains itself once the order is checked.",
      content: { items },
      solution: { order: items.map((i) => i.id), cyclic: v.kind === "cycle" },
    });
  }

  // A contrast set becomes a matching exercise: description to concept.
  if (v.kind === "compare" && v.items.length >= 3) {
    const left: ExerciseItem[] = v.items.map((i, n) => ({ id: `d${n}`, label: i.body }));
    const right: ExerciseItem[] = v.items.map((i, n) => ({ id: `c${n}`, label: i.label }));
    out.push({
      ...common,
      id: `${q.id}:matching`,
      type: "matching",
      title: v.caption ?? "Match each description to its concept",
      instructions: "Connect each description on the left to the concept it describes.",
      learningObjective: "Tell closely related concepts apart by what they actually do.",
      explanation: "These are the distinctions the question turns on.",
      content: { left, right },
      solution: { pairs: Object.fromEntries(left.map((l, n) => [l.id, right[n].id])) },
    });
  }

  // A two-axis grid becomes one categorisation per axis, which is a cleaner
  // exercise than asking for a cell and doubles what the grid is worth.
  if (v.kind === "matrix") {
    const cells: { row: string; col: string; title: string; body: string }[] = [];
    for (const row of v.rows) {
      for (const col of v.cols) {
        const c = v.cells[`${row}|${col}`];
        if (c) cells.push({ row, col, title: c.title, body: c.body });
      }
    }
    // A title appearing in two cells has no single right home; drop it rather
    // than ask an unanswerable question.
    const seen = new Map<string, number>();
    for (const c of cells) seen.set(c.title, (seen.get(c.title) ?? 0) + 1);
    const usable = cells.filter((c) => seen.get(c.title) === 1);

    for (const axis of ["row", "col"] as const) {
      const all = axis === "row" ? v.rows : v.cols;
      // Dropping ambiguous cells can empty a whole row or column. Offering a
      // group that nothing belongs in is a dead target, so only keep groups
      // that still have at least one card after filtering.
      const groups = all.filter((g) => usable.some((c) => (axis === "row" ? c.row : c.col) === g));
      if (groups.length < 2 || usable.length < 4) continue;
      const items: ExerciseItem[] = usable.map((c, n) => ({
        id: `m${n}`,
        label: c.title,
        detail: c.body,
      }));
      out.push({
        ...common,
        id: `${q.id}:categorization-${axis}`,
        type: "categorization",
        title: `${v.caption ?? "Sort these"} — by ${axis === "row" ? groups[0].split(" ")[0] + "-style grouping" : "column"}`,
        instructions: "Drag each card into the group it belongs to.",
        learningObjective: "Classify along one axis at a time before combining them.",
        explanation: "Each card explains itself once placed.",
        content: {
          categories: groups.map((g) => ({ id: slug(g), label: g })),
          items,
        },
        solution: {
          assignments: Object.fromEntries(
            usable.map((c, n) => [`m${n}`, slug(axis === "row" ? c.row : c.col)])
          ),
        },
      });
    }
  }

  return out;
}

export function deriveExercises(pack: CertPack): Exercise[] {
  const out: Exercise[] = [];
  for (const [questionId, enrichment] of Object.entries(pack.enrichment)) {
    if (!enrichment.visual) continue;
    const q = pack.questions.find((x) => x.id === questionId);
    if (!q) continue;
    out.push(...derivedFrom(pack, q, enrichment.visual));
  }
  return out;
}

/* -------------------------- questions as exercises ------------------------ */

/**
 * A `Question` expressed in the exercise model. The SRS drill still runs on
 * `Question` directly — this adapter exists so multiple choice can appear
 * inside an exercise set without becoming a special case in the renderer.
 */
export function exerciseFromQuestion(pack: CertPack, q: Question): Exercise {
  const enrichment = pack.enrichment[q.id];
  return {
    id: `${q.id}:mc`,
    type: "multiple-choice",
    title: `Question ${q.num}`,
    instructions: "Choose the best answer.",
    difficulty: "practice",
    learningObjective: enrichment?.concept?.slice(0, 140) ?? `Recall on ${q.domain}.`,
    hints: enrichment?.trap ? [enrichment.trap] : [],
    explanation: enrichment?.why ?? `The answer is ${q.answer}.`,
    metadata: { packId: pack.id, domain: q.domain, sourceQuestionId: q.id },
    content: {
      prompt: q.stem,
      options: q.options.map((o) => ({ id: o.l, label: o.t })),
      figure: q.figure,
    },
    solution: { correct: q.answer },
  };
}

/* --------------------------------- access --------------------------------- */

/** Everything available for a pack: authored first, then derived. */
export function allExercises(pack: CertPack): Exercise[] {
  return [...(pack.exercises ?? []), ...deriveExercises(pack)];
}

export function countByType(list: Exercise[]): Partial<Record<ExerciseType, number>> {
  const c: Partial<Record<ExerciseType, number>> = {};
  for (const e of list) c[e.type] = (c[e.type] ?? 0) + 1;
  return c;
}

/** How many decisions an exercise asks for — the denominator for scoring. */
export function slotCount(ex: Exercise): number {
  switch (ex.type) {
    case "multiple-choice":
    case "true-false":
      return 1;
    case "multi-select":
      return ex.content.options.length;
    case "matching":
      return Object.keys(ex.solution.pairs).length;
    case "categorization":
      return ex.content.items.length;
    case "sequence":
      return ex.content.items.length;
    case "label-diagram":
      return ex.content.slots.length;
    case "hotspot":
      return ex.solution.targets.length;
  }
}

/**
 * Score an ordering. A cycle has no fixed start, so the best-matching rotation
 * wins — otherwise someone who knows the loop but begins a stage early scores
 * zero, which would be nonsense.
 */
export function scoreOrder(arrangement: number[], cyclic = false): number {
  const n = arrangement.length;
  const hits = (offset: number) =>
    arrangement.filter((itemIdx, pos) => itemIdx === (pos + offset) % n).length;
  if (!cyclic) return hits(0);
  let best = 0;
  for (let off = 0; off < n; off++) best = Math.max(best, hits(off));
  return best;
}

/** Rotation that best matches the intended order, for marking up a cycle. */
export function bestRotation(arrangement: number[], cyclic = false): number {
  if (!cyclic) return 0;
  const n = arrangement.length;
  let best = -1;
  let bestOff = 0;
  for (let off = 0; off < n; off++) {
    const hits = arrangement.filter((itemIdx, pos) => itemIdx === (pos + off) % n).length;
    if (hits > best) {
      best = hits;
      bestOff = off;
    }
  }
  return bestOff;
}

/** Stable per-session shuffle so an exercise does not reshuffle on re-render. */
export function shuffledFor(exerciseId: string, length: number, salt: number): number[] {
  let seed = salt;
  for (let i = 0; i < exerciseId.length; i++) seed = (seed * 31 + exerciseId.charCodeAt(i)) >>> 0;
  return shuffle(
    Array.from({ length }, (_, i) => i),
    seed
  );
}
