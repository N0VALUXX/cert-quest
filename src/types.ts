export type Letter = "A" | "B" | "C" | "D" | "E" | "F";

/** A single answer option. Keys are short because the generated data file is large. */
export interface Option {
  l: Letter;
  t: string;
}

export interface Question {
  id: string;
  num: number;
  domain: string;
  stem: string;
  options: Option[];
  answer: Letter;
  /**
   * A diagram that is part of the *question*, not the explanation — the
   * "refer to the exhibit" pattern the real exams use. Rendered above the
   * options with its explanatory detail suppressed, so it scaffolds or
   * supplies a tool without handing over the answer. After the reveal it
   * becomes the fully interactive explainer.
   */
  figure?: Visual;
}

/** Interactive explainer attached to an enrichment. */
export type Visual =
  | { kind: "steps"; caption?: string; steps: { label: string; body: string }[] }
  | {
      kind: "matrix";
      caption?: string;
      cols: string[];
      rows: string[];
      cells: Record<string, { title: string; body: string; tone?: Tone }>;
    }
  | {
      kind: "timeline";
      caption?: string;
      /** Marker positions are percentages across the track. */
      event: string;
      points: { at: number; label: string; body: string; tone?: Tone }[];
    }
  | {
      kind: "nested";
      caption?: string;
      layers: { label: string; body: string }[];
    }
  | {
      kind: "compare";
      caption?: string;
      items: { label: string; body: string; tone?: Tone }[];
    }
  | {
      kind: "ladder";
      caption?: string;
      rungs: { label: string; body: string }[];
    }
  | {
      kind: "cycle";
      caption?: string;
      /** Ordered around the loop. The last stage feeds back into the first,
       *  which is what distinguishes this from `steps`. */
      stages: { label: string; body: string }[];
    }
  | {
      kind: "formula";
      caption?: string;
      /** Display only, e.g. "ALE = SLE × ARO". The maths lives in `outputs`. */
      expression: string;
      inputs: FormulaInput[];
      outputs: FormulaOutput[];
    };

export interface FormulaInput {
  key: string;
  label: string;
  min: number;
  max: number;
  step: number;
  /** Starting position of the slider. */
  value: number;
  unit?: string;
  /** Rendered instead of the raw number, e.g. 26 -> "/26". */
  prefix?: string;
}

export interface FormulaOutput {
  label: string;
  term: FormulaTerm;
  unit?: string;
  decimals?: number;
  note?: string;
  /** Draws the eye to the answer the question is actually about. */
  headline?: boolean;
}

/**
 * A tiny expression tree. Deliberately not a string to be parsed or evaluated:
 * pack data is content, and content should never be executable.
 */
export type FormulaTerm =
  | { ref: string }
  | { value: number }
  | { op: "add" | "mul" | "sub" | "div" | "pow"; args: FormulaTerm[] };

export type Tone = "good" | "bad" | "warn" | "info" | "neutral";

export interface Reference {
  label: string;
  url: string;
}

export interface Enrichment {
  /** Why the keyed answer is correct. */
  why: string;
  /** Why each distractor fails, keyed by letter. */
  wrong: Partial<Record<Letter, string>>;
  /** The underlying concept the question is really testing. */
  concept: string;
  /** The trap that makes people pick the wrong option. */
  trap: string;
  refs: Reference[];
  visual?: Visual;
  /**
   * Set when the source answer key is contested. `claimed` is the answer many
   * test-takers argue for instead; `argument` explains the disagreement.
   */
  disputed?: { claimed: Letter; argument: string };
}

/* ------------------------------- exercises -------------------------------- */

/**
 * The learning engine is built around exercises, not questions. A multiple
 * choice item is one exercise type among many rather than the shape everything
 * else has to be forced into.
 *
 * Adding a type means adding a member to `ExerciseType`, a `content`/`solution`
 * pair to the `Exercise` union, and a renderer case. Nothing else moves.
 */
export type ExerciseType =
  | "multiple-choice"
  | "multi-select"
  | "true-false"
  | "matching"
  | "categorization"
  | "sequence"
  | "label-diagram"
  | "hotspot";

/** How much scaffolding the exercise offers. Affects hints, distractors, scoring. */
export type ExerciseMode = "learn" | "practice" | "mastery" | "challenge";

export interface ScoringRules {
  base: number;
  perWrongAttempt: number;
  perHint: number;
  perfectBonus: number;
}

export interface ExerciseMeta {
  packId: string;
  domain?: string;
  /** Set when the exercise was derived from, or written against, a question. */
  sourceQuestionId?: string;
  tags?: string[];
}

interface ExerciseCommon {
  id: string;
  title: string;
  instructions: string;
  difficulty: ExerciseMode;
  learningObjective: string;
  hints: string[];
  explanation: string;
  scoring?: Partial<ScoringRules>;
  metadata: ExerciseMeta;
}

/** A labelled thing the learner moves, picks, or connects. */
export interface ExerciseItem {
  id: string;
  label: string;
  detail?: string;
}

export interface ExerciseCategory {
  id: string;
  label: string;
  hint?: string;
}

export type Exercise =
  | (ExerciseCommon & {
      type: "multiple-choice";
      content: { prompt: string; options: ExerciseItem[]; figure?: Visual };
      solution: { correct: string };
    })
  | (ExerciseCommon & {
      type: "multi-select";
      content: { prompt: string; options: ExerciseItem[]; figure?: Visual };
      solution: { correct: string[] };
    })
  | (ExerciseCommon & {
      type: "true-false";
      content: { statement: string; figure?: Visual };
      solution: { correct: boolean };
    })
  | (ExerciseCommon & {
      type: "matching";
      content: { left: ExerciseItem[]; right: ExerciseItem[] };
      /** left id -> right id. Rights not named here are distractors. */
      solution: { pairs: Record<string, string> };
    })
  | (ExerciseCommon & {
      type: "categorization";
      content: { categories: ExerciseCategory[]; items: ExerciseItem[]; figure?: Visual };
      /** item id -> category id, or null for a deliberate distractor card. */
      solution: { assignments: Record<string, string | null> };
    })
  | (ExerciseCommon & {
      type: "sequence";
      content: { items: ExerciseItem[] };
      /** Item ids in the correct order. `cyclic` accepts any rotation. */
      solution: { order: string[]; cyclic?: boolean };
    })
  | (ExerciseCommon & {
      type: "label-diagram";
      /** Slots point at elements of the figure by index; bank may hold extras. */
      content: { figure: Visual; slots: { id: string; elementIndex: number }[]; bank: ExerciseItem[] };
      solution: { placements: Record<string, string> };
    })
  | (ExerciseCommon & {
      type: "hotspot";
      content: { figure: Visual; prompt: string };
      /** Indices of the figure elements that count as correct. */
      solution: { targets: number[] };
    });

export interface CertPack {
  id: string;
  name: string;
  blurb: string;
  questions: Question[];
  enrichment: Record<string, Enrichment>;
  /** Hand-authored exercises. Derived ones are generated from visuals. */
  exercises?: Exercise[];
}

/* ------------------------------- progress -------------------------------- */

export interface Record_ {
  seen: number;
  correct: number;
  wrong: number;
  /** Consecutive correct answers. Resets to 0 on a miss. */
  streak: number;
  lapses: number;
  ease: number;
  /** Scheduling interval in days. */
  interval: number;
  /** Epoch ms when this question is next due. */
  due: number;
  last: number;
  lastCorrect: boolean;
}

export type Mastery = "unseen" | "missed" | "learning" | "solid" | "mastered";

export interface DayStat {
  answered: number;
  correct: number;
  /** Added in progress v2. Drives the weekly goal and the ascent board. */
  xp: number;
}

/** Daily quest counters. Reset when `date` no longer matches today. */
export interface QuestState {
  /** YYYY-MM-DD in local time. */
  date: string;
  answered: number;
  bestCombo: number;
  /** Answers given to cards that were actually due — not every answer counts. */
  reviewed: number;
  /** Pack ids drilled today, for the "second track" quest. */
  tracks: string[];
  /** Quest ids already paid out, so a reward is never granted twice. */
  claimed: string[];
}

/** Local-only identity. Nothing here leaves the device. */
export interface UserProfile {
  name: string;
  /** Key into ACCENTS — retints the whole UI, since everything derives from --accent. */
  accent: string;
}

export interface Progress {
  version: 3;
  records: Record<string, Record_>;
  /** Keyed by YYYY-MM-DD in local time. */
  days: Record<string, DayStat>;
  lastActive: string | null;
  streakDays: number;
  bestStreakDays: number;
  /** XP per pack id. Total XP is the sum — never stored separately, so the
   *  two can't drift apart. */
  xpByPack: Record<string, number>;
  bestCombo: number;
  quests: QuestState;
  /** Pack id -> YYYY-MM-DD exam date, for the runway panel. */
  examDates: Record<string, string>;
  /** Question ids flagged during a drill with F. */
  flagged: string[];
  profile: UserProfile;
  /**
   * Banked days that absorb a gap in the study streak. Losing a long streak to
   * one bad day is the single biggest reason people abandon a study habit.
   */
  restDays: number;
  /**
   * Domain milestones already celebrated, keyed `packId::domain`, so a clear
   * is announced once rather than on every render after it happens.
   */
  clearedDomains: string[];
}
