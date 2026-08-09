import type { Exercise, ExerciseMode, ScoringRules } from "../types";

export const DEFAULT_SCORING: ScoringRules = {
  base: 100,
  perWrongAttempt: 10,
  perHint: 10,
  perfectBonus: 25,
};

/**
 * Difficulty changes what the exercise costs and what it is worth.
 *
 * Learn mode charges nothing for wrong attempts on purpose: the whole point of
 * a guided mode is that poking at it to find out how it works is the intended
 * behaviour, and penalising that teaches people to avoid the mode.
 */
const MODE: Record<ExerciseMode, { wrong: number; hint: number; xp: number }> = {
  learn: { wrong: 0, hint: 0.5, xp: 0.6 },
  practice: { wrong: 1, hint: 1, xp: 1 },
  mastery: { wrong: 1.5, hint: 1.5, xp: 1.4 },
  challenge: { wrong: 2, hint: 2, xp: 1.8 },
};

export interface Attempt {
  /** Slots, pairs, placements or picks that ended up right. */
  correct: number;
  total: number;
  wrongAttempts: number;
  hintsUsed: number;
}

export interface ScoreLine {
  label: string;
  delta: number;
}

export interface Score {
  points: number;
  max: number;
  pct: number;
  perfect: boolean;
  xp: number;
  lines: ScoreLine[];
}

export function rulesFor(ex: Exercise): ScoringRules {
  return { ...DEFAULT_SCORING, ...(ex.scoring ?? {}) };
}

/**
 * Partial credit throughout: getting four of five slots right is genuinely
 * partial knowledge and scoring it zero would be a lie about what happened.
 */
export function scoreExercise(ex: Exercise, attempt: Attempt): Score {
  const rules = rulesFor(ex);
  const mode = MODE[ex.difficulty] ?? MODE.practice;
  const ratio = attempt.total > 0 ? attempt.correct / attempt.total : 0;

  const earned = Math.round(rules.base * ratio);
  const wrongPenalty = Math.round(attempt.wrongAttempts * rules.perWrongAttempt * mode.wrong);
  const hintPenalty = Math.round(attempt.hintsUsed * rules.perHint * mode.hint);
  // In Learn mode wrong attempts are free, and that has to include the bonus —
  // withholding 25 points for exploring is still a punishment for exploring,
  // which is the one thing the guided mode is not supposed to do.
  const attemptsCount = mode.wrong > 0 ? attempt.wrongAttempts === 0 : true;
  const perfect = ratio === 1 && attemptsCount && attempt.hintsUsed === 0;
  const bonus = perfect ? rules.perfectBonus : 0;

  const lines: ScoreLine[] = [
    { label: `${attempt.correct} of ${attempt.total} correct`, delta: earned },
  ];
  if (wrongPenalty > 0) {
    lines.push({ label: `${attempt.wrongAttempts} wrong attempt${attempt.wrongAttempts === 1 ? "" : "s"}`, delta: -wrongPenalty });
  } else if (attempt.wrongAttempts > 0) {
    lines.push({ label: `${attempt.wrongAttempts} wrong — free in Learn mode`, delta: 0 });
  }
  if (hintPenalty > 0) {
    lines.push({ label: `${attempt.hintsUsed} hint${attempt.hintsUsed === 1 ? "" : "s"}`, delta: -hintPenalty });
  }
  if (bonus > 0) lines.push({ label: "Perfect — no hints, no misses", delta: bonus });

  const points = Math.max(0, earned - wrongPenalty - hintPenalty + bonus);
  const max = rules.base + rules.perfectBonus;

  // Kept in the same range as the rest of the economy: a solid exercise is
  // worth appreciably more than one multiple-choice answer, and scales with size.
  const xp = Math.round((points / rules.base) * (30 + 6 * attempt.total) * mode.xp);

  return { points, max, pct: Math.round(ratio * 100), perfect, xp, lines };
}

export const MODE_LABEL: Record<ExerciseMode, string> = {
  learn: "Learn",
  practice: "Practice",
  mastery: "Mastery",
  challenge: "Challenge",
};

export const MODE_BLURB: Record<ExerciseMode, string> = {
  learn: "Guided. Hints are cheap and wrong attempts cost nothing.",
  practice: "Some guidance, some distractors, ordinary scoring.",
  mastery: "Little guidance. Mistakes and hints both cost more.",
  challenge: "Unfamiliar ground, plausible wrong paths, highest stakes.",
};
