import type { CertPack } from "../content-model";
import { cissp } from "./cissp";
import { secplus } from "./secplus";
import { netplus } from "./netplus";
import { aplus } from "./aplus";
import { cysa } from "./cysa";

/**
 * Add further certification packs here — the app is not CISSP-specific.
 *
 * A pack's `id` must be the prefix of every question id it owns
 * (pack `secplus` owns `secplus-1`, `secplus-2`, …). Progress is stored in one
 * flat map keyed by question id, so that prefix is the only thing keeping two
 * packs from overwriting each other's records. `assertPackIds` below enforces
 * it in development.
 */
export const packs: CertPack[] = [cissp, secplus, netplus, aplus, cysa];

export const defaultPack = cissp;

export function packById(id: string | null | undefined): CertPack {
  return packs.find((p) => p.id === id) ?? defaultPack;
}

if (import.meta.env.DEV) {
  const seenPackIds = new Set<string>();
  const seenQuestionIds = new Set<string>();
  for (const pack of packs) {
    if (seenPackIds.has(pack.id)) {
      console.error(`[cert-quest] duplicate pack id "${pack.id}" — progress will collide.`);
    }
    seenPackIds.add(pack.id);

    for (const q of pack.questions) {
      if (!q.id.startsWith(`${pack.id}-`)) {
        console.error(
          `[cert-quest] question "${q.id}" is in pack "${pack.id}" but is not prefixed with it. ` +
            `Progress for this question can collide with another pack.`
        );
      }
      if (seenQuestionIds.has(q.id)) {
        console.error(`[cert-quest] duplicate question id "${q.id}" across packs.`);
      }
      seenQuestionIds.add(q.id);
    }

    for (const id of Object.keys(pack.enrichment)) {
      if (!pack.questions.some((q) => q.id === id)) {
        console.error(`[cert-quest] pack "${pack.id}" has an enrichment for unknown question "${id}".`);
      }
    }
  }
}

