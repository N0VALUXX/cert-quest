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
    };

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

export interface CertPack {
  id: string;
  name: string;
  blurb: string;
  questions: Question[];
  enrichment: Record<string, Enrichment>;
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
}

export interface Progress {
  version: 1;
  records: Record<string, Record_>;
  /** Keyed by YYYY-MM-DD in local time. */
  days: Record<string, DayStat>;
  lastActive: string | null;
  streakDays: number;
  bestStreakDays: number;
}
