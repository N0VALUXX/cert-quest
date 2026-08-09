import { useCallback, useEffect, useRef, useState } from "react";
import type { CertPack, DayStat, Progress, QuestState, Record_, UserProfile } from "../types";
import {
  blankRecord,
  emptyProgress,
  emptyQuests,
  masteryOf,
  recordDay,
  refreshStreak,
  schedule,
  todayKey,
} from "./srs";
import { comboAfter, dailyQuests, domainMastery, wasDue, xpForAnswer } from "./game";

const KEY = "cert-quest:progress:v1";

/**
 * Which pack the user last studied. Deliberately a separate key from the
 * progress blob: it is a disposable UI preference, so losing it costs a click,
 * while `KEY` holds the only irreplaceable data in the app and is never
 * rewritten here. Progress records are keyed by namespaced question id
 * (`cissp-1`, `secplus-1`), so packs share one map without colliding and
 * adding a pack needs no migration.
 */
const PACK_KEY = "cert-quest:pack:v1";

export function useActivePackId(fallback: string) {
  const [packId, setPackId] = useState<string>(() => {
    try {
      return localStorage.getItem(PACK_KEY) ?? fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PACK_KEY, packId);
    } catch {
      // Same as progress: the session still works, the choice just will not stick.
    }
  }, [packId]);

  return [packId, setPackId] as const;
}

/* -------------------------------- migration ------------------------------- */

const CURRENT_VERSION = 3;
const READABLE_VERSIONS = [1, 2, 3];

/**
 * Accepts a v1, v2 or v3 blob and returns v3, or null if it is not ours.
 *
 * v1 had no XP, quests, exam dates or flags; v2 added those plus a coin
 * balance. Coins were removed in v3 — a currency with nothing to spend it on
 * was just a second XP counter — and the field is simply no longer read, so
 * older saves need no rewriting. Everything absent arrives at its default and
 * every `records` entry is carried across untouched, so a returning user keeps
 * their full scheduling history and streak. The storage key never changes.
 *
 * Deliberate: XP is *not* backfilled from existing records, so an established
 * user restarts at level 1 with their SRS state intact.
 */
export function migrate(raw: unknown): Progress | null {
  if (!raw || typeof raw !== "object") return null;
  const p = raw as Record<string, unknown>;

  if (typeof p.version !== "number" || !READABLE_VERSIONS.includes(p.version)) return null;
  if (typeof p.records !== "object" || p.records === null) return null;

  const days: Record<string, DayStat> = {};
  for (const [k, v] of Object.entries((p.days ?? {}) as Record<string, Partial<DayStat>>)) {
    days[k] = { answered: v?.answered ?? 0, correct: v?.correct ?? 0, xp: v?.xp ?? 0 };
  }

  const q = (p.quests ?? {}) as Partial<QuestState>;
  const quests: QuestState = {
    date: q.date ?? todayKey(),
    answered: q.answered ?? 0,
    bestCombo: q.bestCombo ?? 0,
    reviewed: q.reviewed ?? 0,
    tracks: Array.isArray(q.tracks) ? q.tracks : [],
    claimed: Array.isArray(q.claimed) ? q.claimed : [],
  };

  const prof = (p.profile ?? {}) as Partial<UserProfile>;

  return {
    version: CURRENT_VERSION,
    records: p.records as Record<string, Record_>,
    days,
    lastActive: (p.lastActive as string | null) ?? null,
    streakDays: (p.streakDays as number) ?? 0,
    bestStreakDays: (p.bestStreakDays as number) ?? 0,
    xpByPack: (p.xpByPack as Record<string, number>) ?? {},
    bestCombo: (p.bestCombo as number) ?? 0,
    quests,
    examDates: (p.examDates as Record<string, string>) ?? {},
    flagged: Array.isArray(p.flagged) ? (p.flagged as string[]) : [],
    profile: {
      name: typeof prof.name === "string" ? prof.name : "",
      accent: typeof prof.accent === "string" ? prof.accent : "violet",
    },
    restDays: (p.restDays as number) ?? 0,
    clearedDomains: Array.isArray(p.clearedDomains) ? (p.clearedDomains as string[]) : [],
  };
}

/** Quest counters are daily. Clear them when the date has rolled over. */
function rollQuests(progress: Progress): Progress {
  const today = todayKey();
  if (progress.quests.date === today) return progress;
  return { ...progress, quests: emptyQuests(today) };
}

/** Where an unreadable blob is parked instead of being silently discarded. */
const SALVAGE_KEY = "cert-quest:progress:unreadable";

function load(): Progress {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const migrated = migrate(JSON.parse(raw));
    if (migrated) return rollQuests(refreshStreak(migrated));
  } catch {
    // Fall through to salvage.
  }
  // We had bytes but could not read them. Keep a copy: the next write would
  // otherwise destroy the only record of whatever was there.
  try {
    if (raw) localStorage.setItem(SALVAGE_KEY, raw);
  } catch {
    // Nothing more we can do.
  }
  return emptyProgress();
}

function recordCount(p: Progress): number {
  return Object.keys(p.records).length;
}

/* ---------------------------------- hook ---------------------------------- */

export interface AnswerContext {
  /** The pack itself, so a domain clear can be detected at the moment it happens. */
  pack: CertPack;
  /** Combo length *before* this answer, so the multiplier shown is the one paid. */
  combo: number;
}

/** A domain crossing the clear threshold, surfaced once for celebration. */
export interface Milestone {
  packName: string;
  domain: string;
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);
  /** Set only by an explicit reset, which is the one time clearing is intended. */
  const wipeAuthorised = useRef(false);
  /** Staged inside the state updater, surfaced once the write has committed. */
  const pendingMilestone = useRef<Milestone | null>(null);
  const [milestone, setMilestone] = useState<Milestone | null>(null);

  useEffect(() => {
    if (pendingMilestone.current) {
      setMilestone(pendingMilestone.current);
      pendingMilestone.current = null;
    }
  }, [progress]);

  useEffect(() => {
    try {
      // Guard against clobbering real progress with a blank state. If this
      // render's progress has no records but the stored blob does, something
      // went wrong upstream (a failed parse, a crashed load) and writing would
      // destroy the user's only irreplaceable data.
      if (recordCount(progress) === 0 && !wipeAuthorised.current) {
        const raw = localStorage.getItem(KEY);
        if (raw) {
          const stored = migrate(JSON.parse(raw));
          if (stored && recordCount(stored) > 0) return;
        }
      }
      localStorage.setItem(KEY, JSON.stringify(progress));
      wipeAuthorised.current = false;
    } catch {
      // Storage full or blocked. The session still works, it just will not persist.
    }
  }, [progress]);

  const answer = useCallback((questionId: string, correct: boolean, ctx: AnswerContext) => {
    setProgress((prev) => {
      const packId = ctx.pack.id;
      const base = rollQuests(prev);
      const rec = base.records[questionId] ?? blankRecord();
      const due = wasDue(base, questionId);
      // Read the card's state *before* scheduling, so the award matches the
      // figure the drill previewed to the user.
      const mastery = masteryOf(base.records[questionId]);
      const combo = comboAfter(correct, ctx.combo, mastery);

      const quests: QuestState = {
        ...base.quests,
        answered: base.quests.answered + 1,
        bestCombo: Math.max(base.quests.bestCombo, combo),
        reviewed: base.quests.reviewed + (due ? 1 : 0),
        tracks: base.quests.tracks.includes(packId)
          ? base.quests.tracks
          : [...base.quests.tracks, packId],
      };

      // Pay out any quest that just tipped over, once and only once.
      const staged: Progress = { ...base, quests };
      let bonusXp = 0;
      const claimed = [...quests.claimed];
      for (const quest of dailyQuests(staged)) {
        if (quest.cleared && !claimed.includes(quest.id)) {
          claimed.push(quest.id);
          bonusXp += quest.reward;
        }
      }

      const gained = xpForAnswer(correct, ctx.combo, mastery) + bonusXp;

      const next: Progress = {
        ...base,
        records: { ...base.records, [questionId]: schedule(rec, correct) },
        quests: { ...quests, claimed },
        xpByPack: {
          ...base.xpByPack,
          [packId]: (base.xpByPack[packId] ?? 0) + gained,
        },
        bestCombo: Math.max(base.bestCombo, combo),
      };

      // Did this answer just clear a domain? Checked against the post-answer
      // state, and recorded so it is announced exactly once.
      const domain = ctx.pack.questions.find((q) => q.id === questionId)?.domain;
      if (domain) {
        const key = `${packId}::${domain}`;
        if (!next.clearedDomains.includes(key)) {
          const stat = domainMastery(ctx.pack, next).find((d) => d.name === domain);
          if (stat?.cleared) {
            next.clearedDomains = [...next.clearedDomains, key];
            pendingMilestone.current = { packName: ctx.pack.name, domain };
          }
        }
      }

      return recordDay(next, correct, gained);
    });
  }, []);

  /**
   * A completed concept exercise. Deliberately does **not** touch `records`:
   * reordering a ladder is a different retrieval from answering the multiple
   * choice it came from, and folding it into the same schedule would corrupt
   * the signal the SRS runs on. It pays XP and counts toward the day.
   */
  const completeExercise = useCallback(
    (pack: CertPack, rounds: number, correct: number, xp: number) => {
      setProgress((prev) => {
        const base = rollQuests(prev);
        const quests: QuestState = {
          ...base.quests,
          answered: base.quests.answered + rounds,
          tracks: base.quests.tracks.includes(pack.id)
            ? base.quests.tracks
            : [...base.quests.tracks, pack.id],
        };
        let next: Progress = {
          ...base,
          quests,
          xpByPack: { ...base.xpByPack, [pack.id]: (base.xpByPack[pack.id] ?? 0) + xp },
        };
        // Day counters take one entry per retrieval decision made.
        for (let n = 0; n < rounds; n++) {
          next = recordDay(next, n < correct, n === 0 ? xp : 0);
        }
        return next;
      });
    },
    []
  );

  const toggleFlag = useCallback((questionId: string) => {
    setProgress((prev) => ({
      ...prev,
      flagged: prev.flagged.includes(questionId)
        ? prev.flagged.filter((id) => id !== questionId)
        : [...prev.flagged, questionId],
    }));
  }, []);

  const setProfile = useCallback((patch: Partial<UserProfile>) => {
    setProgress((prev) => ({ ...prev, profile: { ...prev.profile, ...patch } }));
  }, []);

  const dismissMilestone = useCallback(() => setMilestone(null), []);

  const setExamDate = useCallback((packId: string, date: string | null) => {
    setProgress((prev) => {
      const examDates = { ...prev.examDates };
      if (date) examDates[packId] = date;
      else delete examDates[packId];
      return { ...prev, examDates };
    });
  }, []);

  const reset = useCallback(() => {
    wipeAuthorised.current = true;
    setProgress(emptyProgress());
  }, []);

  const exportJSON = useCallback(() => JSON.stringify(progress, null, 2), [progress]);

  const importJSON = useCallback((raw: string) => {
    // Accepts v1 and v2. Rejecting v1 here would strand every backup exported
    // before the game layer existed.
    const migrated = migrate(JSON.parse(raw));
    if (!migrated) {
      throw new Error("That file is not a cert-quest progress export.");
    }
    setProgress(rollQuests(refreshStreak(migrated)));
  }, []);

  return {
    progress,
    answer,
    completeExercise,
    toggleFlag,
    setExamDate,
    setProfile,
    milestone,
    dismissMilestone,
    reset,
    exportJSON,
    importJSON,
  };
}
