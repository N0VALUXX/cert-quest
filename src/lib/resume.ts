import type { QueueMode } from "./srs";

/**
 * A drill in progress, parked so an interruption does not destroy it.
 *
 * Losing a half-finished run is a real reason not to start one — if being
 * pulled away costs you the session, the rational move is to not begin until
 * you have a clear half hour, which is most of the reason people never begin.
 *
 * Kept in its own key: it is disposable, unlike progress, and a corrupt or
 * stale saved run must never be able to endanger the records.
 */
const KEY = "cert-quest:session:v1";

export interface SavedRun {
  packId: string;
  mode: QueueMode;
  /** Question ids, in the order the run will present them. */
  queue: string[];
  index: number;
  results: { id: string; correct: boolean }[];
  combo: number;
  bestCombo: number;
  runXp: number;
  times: number[];
  /** Epoch ms, so a run abandoned days ago can be discarded. */
  savedAt: number;
}

/** Runs older than this are not worth resuming into. */
const MAX_AGE_MS = 3 * 86_400_000;

export function saveRun(run: SavedRun): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(run));
  } catch {
    // Storage full or blocked. The run continues, it just will not survive.
  }
}

export function clearRun(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // Nothing to do.
  }
}

/**
 * The parked run, if there is one worth offering. Returns null rather than
 * throwing on anything unexpected — a bad saved run should be silently
 * forgotten, never surfaced as an error.
 */
export function loadRun(packId: string, mode: QueueMode): SavedRun | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const r = JSON.parse(raw) as Partial<SavedRun>;

    if (r.packId !== packId || r.mode !== mode) return null;
    if (!Array.isArray(r.queue) || r.queue.length === 0) return null;
    if (typeof r.index !== "number" || r.index < 0 || r.index >= r.queue.length) return null;
    if (typeof r.savedAt !== "number" || Date.now() - r.savedAt > MAX_AGE_MS) return null;

    return {
      packId,
      mode,
      queue: r.queue.filter((id): id is string => typeof id === "string"),
      index: r.index,
      results: Array.isArray(r.results) ? r.results : [],
      combo: r.combo ?? 0,
      bestCombo: r.bestCombo ?? 0,
      runXp: r.runXp ?? 0,
      times: Array.isArray(r.times) ? r.times : [],
      savedAt: r.savedAt,
    };
  } catch {
    return null;
  }
}

/** Human-readable age for the resume prompt. */
export function ageLabel(savedAt: number): string {
  const mins = Math.floor((Date.now() - savedAt) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}
