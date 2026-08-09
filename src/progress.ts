import type { Letter } from "./content-model";

export type Confidence = "guessing" | "unsure" | "confident";

export interface Attempt {
  readonly id: string;
  readonly questionId: string;
  readonly packId: string;
  readonly domain: string;
  readonly answer: Letter;
  readonly correct: boolean;
  readonly confidence: Confidence;
  readonly xp: number;
  readonly occurredAt: number;
  readonly durationMs: number;
}

export interface Preferences {
  readonly selectedPackId: string;
  readonly examDates: Readonly<Record<string, string>>;
  readonly name: string;
}

export interface ProgressData {
  readonly version: 1;
  readonly attempts: readonly Attempt[];
  readonly preferences: Preferences;
}

const STORAGE_KEY = "cert-quest:fresh:v1";

export function emptyProgress(selectedPackId: string): ProgressData {
  return {
    version: 1,
    attempts: [],
    preferences: { selectedPackId, examDates: {}, name: "" },
  };
}

export function loadProgress(selectedPackId: string): ProgressData {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) return emptyProgress(selectedPackId);
    const parsed: unknown = JSON.parse(raw);
    if (!isProgressData(parsed)) return emptyProgress(selectedPackId);
    return parsed;
  } catch {
    return emptyProgress(selectedPackId);
  }
}

export function saveProgress(progress: ProgressData): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function exportProgress(progress: ProgressData): void {
  const payload = JSON.stringify({ exportedAt: new Date().toISOString(), progress }, null, 2);
  const url = URL.createObjectURL(new Blob([payload], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `cert-quest-backup-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export async function importProgress(file: File): Promise<ProgressData> {
  const parsed: unknown = JSON.parse(await file.text());
  if (isExportEnvelope(parsed)) return parsed.progress;
  if (isProgressData(parsed)) return parsed;
  throw new Error("This file is not a valid Cert Quest backup.");
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isProgressData(value: unknown): value is ProgressData {
  if (!isObject(value) || value.version !== 1 || !Array.isArray(value.attempts)) return false;
  if (!isObject(value.preferences)) return false;
  return typeof value.preferences.selectedPackId === "string";
}

function isExportEnvelope(value: unknown): value is { readonly progress: ProgressData } {
  return isObject(value) && isProgressData(value.progress);
}
