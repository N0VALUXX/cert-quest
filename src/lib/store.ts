import { useCallback, useEffect, useState } from "react";
import type { Progress } from "../types";
import { blankRecord, emptyProgress, recordDay, refreshStreak, schedule } from "./srs";

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

function load(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyProgress();
    const parsed = JSON.parse(raw) as Progress;
    if (parsed.version !== 1) return emptyProgress();
    return refreshStreak(parsed);
  } catch {
    return emptyProgress();
  }
}

export function useProgress() {
  const [progress, setProgress] = useState<Progress>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(progress));
    } catch {
      // Storage full or blocked. The session still works, it just will not persist.
    }
  }, [progress]);

  const answer = useCallback((questionId: string, correct: boolean) => {
    setProgress((prev) => {
      const rec = prev.records[questionId] ?? blankRecord();
      const next = {
        ...prev,
        records: { ...prev.records, [questionId]: schedule(rec, correct) },
      };
      return recordDay(next, correct);
    });
  }, []);

  const reset = useCallback(() => setProgress(emptyProgress()), []);

  const exportJSON = useCallback(() => JSON.stringify(progress, null, 2), [progress]);

  const importJSON = useCallback((raw: string) => {
    const parsed = JSON.parse(raw) as Progress;
    if (parsed.version !== 1 || typeof parsed.records !== "object") {
      throw new Error("That file is not a cert-quest progress export.");
    }
    setProgress(refreshStreak(parsed));
  }, []);

  return { progress, answer, reset, exportJSON, importJSON };
}
