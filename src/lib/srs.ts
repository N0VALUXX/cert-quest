import type { Mastery, Progress, QuestState, Question, Record_ } from "../types";

const DAY = 86_400_000;

export function todayKey(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function emptyQuests(date = todayKey()): QuestState {
  return { date, answered: 0, bestCombo: 0, reviewed: 0, tracks: [], claimed: [] };
}

export function emptyProgress(): Progress {
  return {
    version: 2,
    records: {},
    days: {},
    lastActive: null,
    streakDays: 0,
    bestStreakDays: 0,
    xpByPack: {},
    coins: 0,
    bestCombo: 0,
    quests: emptyQuests(),
    examDates: {},
    flagged: [],
  };
}

export function blankRecord(): Record_ {
  return {
    seen: 0,
    correct: 0,
    wrong: 0,
    streak: 0,
    lapses: 0,
    ease: 2.5,
    interval: 0,
    due: 0,
    last: 0,
    lastCorrect: false,
  };
}

/**
 * SM-2, simplified. A miss drops the card back into relearning immediately
 * rather than pushing it days out, which is what you want when you are
 * cramming for a dated exam rather than maintaining knowledge forever.
 */
export function schedule(prev: Record_, correct: boolean, now = Date.now()): Record_ {
  const r: Record_ = { ...prev };
  r.seen += 1;
  r.last = now;
  r.lastCorrect = correct;

  if (!correct) {
    r.wrong += 1;
    r.lapses += 1;
    r.streak = 0;
    r.ease = Math.max(1.3, r.ease - 0.2);
    r.interval = 0;
    r.due = now; // back in the queue this session
    return r;
  }

  r.correct += 1;
  r.streak += 1;
  r.ease = Math.min(2.8, r.ease + 0.05);
  if (r.interval === 0) r.interval = 1;
  else if (r.interval === 1) r.interval = 3;
  else r.interval = Math.round(r.interval * r.ease);
  r.due = now + r.interval * DAY;
  return r;
}

export function masteryOf(rec: Record_ | undefined): Mastery {
  if (!rec || rec.seen === 0) return "unseen";
  if (!rec.lastCorrect) return "missed";
  if (rec.streak >= 4) return "mastered";
  if (rec.streak >= 2) return "solid";
  return "learning";
}

export const MASTERY_ORDER: Mastery[] = ["missed", "unseen", "learning", "solid", "mastered"];

export const MASTERY_LABEL: Record<Mastery, string> = {
  unseen: "Unseen",
  missed: "Missed",
  learning: "Learning",
  solid: "Solid",
  mastered: "Mastered",
};

/** Lower sorts first: the things you are worst at. */
function weakness(q: Question, progress: Progress, now: number): number {
  const rec = progress.records[q.id];
  if (!rec || rec.seen === 0) return 100; // unseen sits after known-weak
  const accuracy = rec.correct / rec.seen;
  const overdue = rec.due <= now ? 0 : 200; // not-yet-due drops to the back
  return overdue + accuracy * 50 - rec.lapses * 8 + rec.streak * 5;
}

/** Deterministic shuffle so a given seed always produces the same test. */
export function shuffle<T>(arr: T[], seed = Date.now()): T[] {
  const a = [...arr];
  let s = seed >>> 0;
  const rand = () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export type QueueMode = "random" | "weak" | "missed" | "unseen";

export function buildQueue(
  questions: Question[],
  progress: Progress,
  mode: QueueMode,
  size: number,
  seed = Date.now()
): Question[] {
  const now = Date.now();
  let pool = questions;

  if (mode === "missed") {
    pool = questions.filter((q) => {
      const r = progress.records[q.id];
      return r && r.wrong > 0;
    });
    // Most-missed first, exactly as the brief asks.
    pool = [...pool].sort((a, b) => {
      const ra = progress.records[a.id]!;
      const rb = progress.records[b.id]!;
      if (rb.wrong !== ra.wrong) return rb.wrong - ra.wrong;
      return ra.correct / ra.seen - rb.correct / rb.seen;
    });
    return pool.slice(0, size);
  }

  if (mode === "unseen") {
    pool = questions.filter((q) => !progress.records[q.id]);
    return shuffle(pool, seed).slice(0, size);
  }

  if (mode === "weak") {
    pool = [...questions].sort((a, b) => weakness(a, progress, now) - weakness(b, progress, now));
    return pool.slice(0, size);
  }

  return shuffle(questions, seed).slice(0, size);
}

export function recordDay(progress: Progress, correct: boolean, xp = 0): Progress {
  const key = todayKey();
  const days = { ...progress.days };
  const cur = days[key] ?? { answered: 0, correct: 0, xp: 0 };
  days[key] = {
    answered: cur.answered + 1,
    correct: cur.correct + (correct ? 1 : 0),
    xp: (cur.xp ?? 0) + xp,
  };

  let { streakDays, bestStreakDays } = progress;
  if (progress.lastActive !== key) {
    const yesterday = todayKey(new Date(Date.now() - DAY));
    streakDays = progress.lastActive === yesterday ? streakDays + 1 : 1;
    bestStreakDays = Math.max(bestStreakDays, streakDays);
  }

  return { ...progress, days, lastActive: key, streakDays, bestStreakDays };
}

/** Rebuilds the day streak on load so it decays when you skip days. */
export function refreshStreak(progress: Progress): Progress {
  if (!progress.lastActive) return progress;
  const today = todayKey();
  const yesterday = todayKey(new Date(Date.now() - DAY));
  if (progress.lastActive === today || progress.lastActive === yesterday) return progress;
  return { ...progress, streakDays: 0 };
}
