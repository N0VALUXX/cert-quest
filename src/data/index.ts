import type { CertPack } from "../types";
import { cissp } from "./cissp";

/** Add further certification packs here — the app is not CISSP-specific. */
export const packs: CertPack[] = [cissp];

export const defaultPack = cissp;
