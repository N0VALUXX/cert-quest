import type { CertPack, Mastery, Progress, Question } from "../types";
import { masteryOf, todayKey } from "./srs";

/* ---------------------------------- XP ----------------------------------- */

/** Base award for a correct answer. Matches the mockup's xpPerCorrect default. */
export const XP_PER_CORRECT = 40;

/**
 * A miss pays a share of what the card would have paid, never less than the
 * floor. Missing something hard is worth more than missing something easy,
 * and attempting a hard card you fail still beats grinding one you know.
 */
export const XP_MISS_SHARE = 0.25;
export const XP_MISS_FLOOR = 5;

/**
 * XP scales with how much the card has left to teach you.
 *
 * The principle: XP is paid for *learning events*. Answering a card you have
 * already mastered is not one, so it pays almost nothing — that is what kills
 * the incentive to farm easy material instead of following the weak-first
 * queue the app routes you to.
 *
 * Note this does not, and is not meant to, make a 50% run on new cards
 * out-earn a flawless run on solid ones. Twenty successful retrievals really
 * is more practice than ten, and pretending otherwise would distort the
 * numbers past the point of being believable.
 */
export const MASTERY_XP_MULTIPLIER: Record<Mastery, number> = {
  missed: 1.6,
  unseen: 1.5,
  learning: 1.25,
  solid: 0.75,
  mastered: 0.15,
};

/** Combo thresholds and the multiplier each one unlocks. Highest first. */
const COMBO_TIERS: { at: number; multiplier: number }[] = [
  { at: 10, multiplier: 2 },
  { at: 5, multiplier: 1.5 },
];

/** The multiplier currently in force for a given combo length. */
export function comboMultiplier(combo: number): number {
  return COMBO_TIERS.find((t) => combo >= t.at)?.multiplier ?? 1;
}

/** The next tier a combo is working toward, or null once it is maxed. */
export function nextComboTier(combo: number): { at: number; multiplier: number } | null {
  const ascending = [...COMBO_TIERS].reverse();
  return ascending.find((t) => combo < t.at) ?? null;
}

/**
 * XP for one answer. `combo` is the streak *before* this answer and `mastery`
 * is the card's state *before* it, so the figure shown on the card ahead of
 * time is exactly the figure paid.
 */
export function xpForAnswer(correct: boolean, combo: number, mastery: Mastery = "solid"): number {
  const base = XP_PER_CORRECT * MASTERY_XP_MULTIPLIER[mastery];
  if (!correct) return Math.max(XP_MISS_FLOOR, Math.round(base * XP_MISS_SHARE));
  return Math.round(base * comboMultiplier(combo));
}

/**
 * The combo after an answer. Missing a card you have never seen does not break
 * the run — you cannot be blamed for not knowing something new, and punishing
 * it is what pushes people back toward material they have already mastered.
 * Missing a card you have seen before still resets.
 */
export function comboAfter(correct: boolean, combo: number, mastery: Mastery): number {
  if (correct) return combo + 1;
  return mastery === "unseen" ? combo : 0;
}

/** Why a card is worth what it is worth, for the drill readout. */
export function xpReason(mastery: Mastery): string {
  switch (mastery) {
    case "unseen":
      return "new card";
    case "missed":
      return "relearning";
    case "learning":
      return "still shaky";
    case "solid":
      return "solid";
    case "mastered":
      return "already mastered";
  }
}

/**
 * Triangular level curve: level L begins at STEP * L * (L-1) / 2, so each
 * level costs STEP more than the one before. Level 1 starts at zero XP.
 */
const STEP = 200;

export function levelFromXp(xp: number): number {
  if (xp <= 0) return 1;
  return Math.floor((1 + Math.sqrt(1 + (8 * xp) / STEP)) / 2);
}

export function levelFloor(level: number): number {
  return (STEP * level * (level - 1)) / 2;
}

/** Where the player sits inside the current level, for the ring. */
export function xpIntoLevel(xp: number): { into: number; span: number; pct: number } {
  const level = levelFromXp(xp);
  const floor = levelFloor(level);
  const span = levelFloor(level + 1) - floor;
  const into = Math.max(0, xp - floor);
  return { into, span, pct: span > 0 ? Math.round((into / span) * 100) : 0 };
}

export function totalXp(progress: Progress): number {
  return Object.values(progress.xpByPack).reduce((a, b) => a + b, 0);
}

export function packXp(progress: Progress, packId: string): number {
  return progress.xpByPack[packId] ?? 0;
}

/* ------------------------------- readiness -------------------------------- */

/**
 * How much each mastery state contributes to being exam-ready. Unseen and
 * missed are worth nothing on purpose: the number should not creep upward
 * just because you have looked at a question once and got it wrong.
 */
const READINESS_WEIGHT: Record<Mastery, number> = {
  unseen: 0,
  missed: 0,
  learning: 0.35,
  solid: 0.7,
  mastered: 1,
};

function readinessOf(questions: Question[], progress: Progress): number {
  if (questions.length === 0) return 0;
  let sum = 0;
  for (const q of questions) sum += READINESS_WEIGHT[masteryOf(progress.records[q.id])];
  return Math.round((sum / questions.length) * 100);
}

/** The headline "62% EXAM READY" figure for a pack. */
export function examReadiness(pack: CertPack, progress: Progress): number {
  return readinessOf(pack.questions, progress);
}

export interface DomainStat {
  name: string;
  total: number;
  readiness: number;
  seen: number;
  cleared: boolean;
}

/** A domain counts as cleared once it is 80% ready — the mock-exam gate. */
export const DOMAIN_CLEAR_AT = 80;

export function domainMastery(pack: CertPack, progress: Progress): DomainStat[] {
  const byDomain = new Map<string, Question[]>();
  for (const q of pack.questions) {
    const list = byDomain.get(q.domain);
    if (list) list.push(q);
    else byDomain.set(q.domain, [q]);
  }

  return [...byDomain.entries()].map(([name, questions]) => {
    const readiness = readinessOf(questions, progress);
    let seen = 0;
    for (const q of questions) if (progress.records[q.id]) seen++;
    return { name, total: questions.length, readiness, seen, cleared: readiness >= DOMAIN_CLEAR_AT };
  });
}

/* ------------------------------- due review ------------------------------- */

export interface DueGroup {
  domain: string;
  count: number;
  /** Most overdue card in the group, in whole days. Negative means upcoming. */
  daysOverdue: number;
}

export interface DueSummary {
  total: number;
  groups: DueGroup[];
}

const DAY = 86_400_000;

/**
 * Cards that have been seen and are at or near their due date, grouped by
 * domain for the review panel. Unseen cards are excluded — this is the
 * spaced-repetition pile, not the backlog.
 */
export function dueForReview(pack: CertPack, progress: Progress, horizonDays = 1): DueSummary {
  const now = Date.now();
  const groups = new Map<string, { count: number; daysOverdue: number }>();
  let total = 0;

  for (const q of pack.questions) {
    const rec = progress.records[q.id];
    if (!rec || rec.seen === 0) continue;
    const overdueMs = now - rec.due;
    if (overdueMs < -horizonDays * DAY) continue;

    total++;
    const days = Math.floor(overdueMs / DAY);
    const cur = groups.get(q.domain);
    if (cur) {
      cur.count++;
      cur.daysOverdue = Math.max(cur.daysOverdue, days);
    } else {
      groups.set(q.domain, { count: 1, daysOverdue: days });
    }
  }

  return {
    total,
    groups: [...groups.entries()]
      .map(([domain, v]) => ({ domain, ...v }))
      .sort((a, b) => b.daysOverdue - a.daysOverdue || b.count - a.count),
  };
}

/** Whether a specific card was due at the moment it was answered. */
export function wasDue(progress: Progress, questionId: string, now = Date.now()): boolean {
  const rec = progress.records[questionId];
  return !!rec && rec.seen > 0 && rec.due <= now;
}

/* --------------------------------- quests --------------------------------- */

export interface Quest {
  id: string;
  label: string;
  reward: number;
  done: number;
  target: number;
  cleared: boolean;
}

/**
 * The four daily quests from the dashboard. Every one is measured from
 * counters we genuinely track, so none of them can be satisfied by anything
 * other than real study.
 */
export function dailyQuests(progress: Progress): Quest[] {
  const q = progress.quests;
  const fresh = q.date === todayKey() ? q : null;
  const answered = fresh?.answered ?? 0;
  const bestCombo = fresh?.bestCombo ?? 0;
  const reviewed = fresh?.reviewed ?? 0;
  const tracks = fresh?.tracks.length ?? 0;

  const build = (id: string, label: string, reward: number, done: number, target: number): Quest => ({
    id,
    label,
    reward,
    done: Math.min(done, target),
    target,
    cleared: done >= target,
  });

  return [
    build("answer-20", "Answer 20 questions", 80, answered, 20),
    build("combo-5", "Hit a 5-answer combo", 60, bestCombo, 5),
    build("review-10", "Review 10 due cards", 100, reviewed, 10),
    build("second-track", "Drill on a second track", 150, tracks, 2),
  ];
}

export function questsCleared(progress: Progress): number {
  return dailyQuests(progress).filter((q) => q.cleared).length;
}

/** XP still on the table today. */
export function questXpRemaining(progress: Progress): number {
  return dailyQuests(progress)
    .filter((q) => !q.cleared)
    .reduce((sum, q) => sum + q.reward, 0);
}

/** Milliseconds until the quest board resets at local midnight. */
export function msUntilQuestReset(now = new Date()): number {
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  return midnight.getTime() - now.getTime();
}

/* --------------------------------- weekly --------------------------------- */

export const WEEKLY_GOAL_XP = 4000;

export interface WeekSummary {
  xp: number;
  goal: number;
  pct: number;
  /** Best week the user has ever logged, for the ascent board. */
  best: number;
}

/** XP over the trailing seven days, against the weekly goal. */
export function weeklyXp(progress: Progress, days = 7): WeekSummary {
  const now = Date.now();
  let xp = 0;
  for (let d = 0; d < days; d++) {
    const key = todayKey(new Date(now - d * DAY));
    xp += progress.days[key]?.xp ?? 0;
  }

  // Walk every logged day in week-sized windows to find the best stretch.
  const keys = Object.keys(progress.days).sort();
  let best = xp;
  if (keys.length > 0) {
    const first = new Date(`${keys[0]}T00:00:00`).getTime();
    for (let start = first; start <= now; start += DAY) {
      let sum = 0;
      for (let d = 0; d < days; d++) sum += progress.days[todayKey(new Date(start + d * DAY))]?.xp ?? 0;
      if (sum > best) best = sum;
    }
  }

  return { xp, goal: WEEKLY_GOAL_XP, pct: Math.round((xp / WEEKLY_GOAL_XP) * 100), best };
}

/* -------------------------------- identity -------------------------------- */

/**
 * Accent choices. Each retints the whole interface, because every surface
 * colour in the stylesheet derives from --accent rather than a literal.
 */
export const ACCENTS: { id: string; label: string; hex: string; deep: string }[] = [
  { id: "violet", label: "Violet", hex: "#8b5cf6", deep: "#6d3bf0" },
  { id: "cyan", label: "Cyan", hex: "#22b8cf", deep: "#0e7490" },
  { id: "ember", label: "Ember", hex: "#f97362", deep: "#c2410c" },
  { id: "lime", label: "Lime", hex: "#84cc16", deep: "#4d7c0f" },
  { id: "rose", label: "Rose", hex: "#f472b6", deep: "#be185d" },
  { id: "slate", label: "Slate", hex: "#7c8aa5", deep: "#475569" },
];

export function accentById(id: string) {
  return ACCENTS.find((a) => a.id === id) ?? ACCENTS[0];
}

/** Up to two letters for the profile badge, falling back to a neutral mark. */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "··";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * A title earned from what has actually been cleared, not from volume. Falls
 * back through level so a new user still has something, but the good titles
 * only come from clearing domains.
 */
export function earnedTitle(packs: CertPack[], progress: Progress): string {
  const cleared: string[] = [];
  for (const pack of packs) {
    for (const d of domainMastery(pack, progress)) {
      if (d.cleared) cleared.push(d.name);
    }
  }
  if (cleared.length >= 5) return "Multi-domain specialist";
  if (cleared.length > 1) return `${cleared.length} domains cleared`;
  if (cleared.length === 1) return `${cleared[0]}, cleared`;

  const level = levelFromXp(totalXp(progress));
  if (level >= 10) return "Deep in the work";
  if (level >= 5) return "Building momentum";
  if (level >= 2) return "Getting started";
  return "New recruit";
}

/* ------------------------------- exam runway ------------------------------ */

export interface Runway {
  packId: string;
  date: string | null;
  daysLeft: number | null;
}

export function examRunway(progress: Progress, packId: string): Runway {
  const date = progress.examDates[packId] ?? null;
  if (!date) return { packId, date: null, daysLeft: null };
  const target = new Date(`${date}T00:00:00`).getTime();
  const daysLeft = Math.ceil((target - Date.now()) / DAY);
  return { packId, date, daysLeft };
}

/**
 * Rough projection: at the given daily XP rate, how many days until the pack
 * is judged exam ready. Returns null when there is no rate to project from.
 */
export function daysToReady(pack: CertPack, progress: Progress, xpPerDay: number): number | null {
  if (xpPerDay <= 0) return null;
  const readiness = examReadiness(pack, progress);
  if (readiness >= 100) return 0;
  // Each question needs roughly four correct answers to reach mastered.
  const remaining = pack.questions.length * ((100 - readiness) / 100) * 4 * XP_PER_CORRECT;
  return Math.ceil(remaining / xpPerDay);
}
