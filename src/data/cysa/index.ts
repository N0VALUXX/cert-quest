import type { CertPack } from "../../content-model";
import { cysaQuestions } from "./questions";
import { batch1 } from "./enrichment-1";

export const cysa: CertPack = {
  id: "cysa",
  name: "CySA+",
  blurb: "CompTIA CySA+ (CS0-003)",
  questions: cysaQuestions,
  enrichment: { ...batch1 },
};

