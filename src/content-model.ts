export type Letter = "A" | "B" | "C" | "D" | "E" | "F";

export interface Option {
  readonly l: Letter;
  readonly t: string;
}

export interface Question {
  readonly id: string;
  readonly num: number;
  readonly domain: string;
  readonly stem: string;
  readonly options: readonly Option[];
  readonly answer: Letter;
  readonly figure?: Visual;
}

export type Tone = "good" | "bad" | "warn" | "info" | "neutral";

export type Visual =
  | { readonly kind: "steps"; readonly caption?: string; readonly steps: readonly { readonly label: string; readonly body: string }[] }
  | { readonly kind: "matrix"; readonly caption?: string; readonly cols: readonly string[]; readonly rows: readonly string[]; readonly cells: Readonly<Record<string, { readonly title: string; readonly body: string; readonly tone?: Tone }>> }
  | { readonly kind: "timeline"; readonly caption?: string; readonly event: string; readonly points: readonly { readonly at: number; readonly label: string; readonly body: string; readonly tone?: Tone }[] }
  | { readonly kind: "nested"; readonly caption?: string; readonly layers: readonly { readonly label: string; readonly body: string }[] }
  | { readonly kind: "compare"; readonly caption?: string; readonly items: readonly { readonly label: string; readonly body: string; readonly tone?: Tone }[] }
  | { readonly kind: "ladder"; readonly caption?: string; readonly rungs: readonly { readonly label: string; readonly body: string }[] }
  | { readonly kind: "cycle"; readonly caption?: string; readonly stages: readonly { readonly label: string; readonly body: string }[] }
  | { readonly kind: "formula"; readonly caption?: string; readonly expression: string; readonly inputs: readonly FormulaInput[]; readonly outputs: readonly FormulaOutput[] };

export interface FormulaInput {
  readonly key: string;
  readonly label: string;
  readonly min: number;
  readonly max: number;
  readonly step: number;
  readonly value: number;
  readonly unit?: string;
  readonly prefix?: string;
}

export interface FormulaOutput {
  readonly label: string;
  readonly term: FormulaTerm;
  readonly unit?: string;
  readonly decimals?: number;
  readonly note?: string;
  readonly headline?: boolean;
}

export type FormulaTerm =
  | { readonly ref: string }
  | { readonly value: number }
  | { readonly op: "add" | "mul" | "sub" | "div" | "pow"; readonly args: readonly FormulaTerm[] };

export interface Reference {
  readonly label: string;
  readonly url: string;
}

export interface Enrichment {
  readonly why: string;
  readonly wrong: Partial<Record<Letter, string>>;
  readonly concept: string;
  readonly trap: string;
  readonly refs: readonly Reference[];
  readonly visual?: Visual;
  readonly disputed?: { readonly claimed: Letter; readonly argument: string };
}

export type ExerciseMode = "learn" | "practice" | "mastery" | "challenge";

export interface ExerciseItem {
  readonly id: string;
  readonly label: string;
  readonly detail?: string;
}

export interface ExerciseCategory {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
}

interface ExerciseCommon {
  readonly id: string;
  readonly title: string;
  readonly instructions: string;
  readonly difficulty: ExerciseMode;
  readonly learningObjective: string;
  readonly hints: readonly string[];
  readonly explanation: string;
  readonly scoring?: Partial<{ readonly base: number; readonly perWrongAttempt: number; readonly perHint: number; readonly perfectBonus: number }>;
  readonly metadata: { readonly packId: string; readonly domain?: string; readonly sourceQuestionId?: string; readonly tags?: readonly string[] };
}

export type Exercise =
  | (ExerciseCommon & { readonly type: "multiple-choice"; readonly content: { readonly prompt: string; readonly options: readonly ExerciseItem[]; readonly figure?: Visual }; readonly solution: { readonly correct: string } })
  | (ExerciseCommon & { readonly type: "multi-select"; readonly content: { readonly prompt: string; readonly options: readonly ExerciseItem[]; readonly figure?: Visual }; readonly solution: { readonly correct: readonly string[] } })
  | (ExerciseCommon & { readonly type: "true-false"; readonly content: { readonly statement: string; readonly figure?: Visual }; readonly solution: { readonly correct: boolean } })
  | (ExerciseCommon & { readonly type: "matching"; readonly content: { readonly left: readonly ExerciseItem[]; readonly right: readonly ExerciseItem[] }; readonly solution: { readonly pairs: Readonly<Record<string, string>> } })
  | (ExerciseCommon & { readonly type: "categorization"; readonly content: { readonly categories: readonly ExerciseCategory[]; readonly items: readonly ExerciseItem[]; readonly figure?: Visual }; readonly solution: { readonly assignments: Readonly<Record<string, string | null>> } })
  | (ExerciseCommon & { readonly type: "sequence"; readonly content: { readonly items: readonly ExerciseItem[] }; readonly solution: { readonly order: readonly string[]; readonly cyclic?: boolean } })
  | (ExerciseCommon & { readonly type: "label-diagram"; readonly content: { readonly figure: Visual; readonly slots: readonly { readonly id: string; readonly elementIndex: number }[]; readonly bank: readonly ExerciseItem[] }; readonly solution: { readonly placements: Readonly<Record<string, string>> } })
  | (ExerciseCommon & { readonly type: "hotspot"; readonly content: { readonly figure: Visual; readonly prompt: string }; readonly solution: { readonly targets: readonly number[] } });

export interface CertPack {
  readonly id: string;
  readonly name: string;
  readonly blurb: string;
  readonly questions: readonly Question[];
  readonly enrichment: Readonly<Record<string, Enrichment>>;
  readonly exercises?: readonly Exercise[];
}
