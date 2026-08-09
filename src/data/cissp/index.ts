import type { CertPack } from "../../content-model";
import { cisspQuestions } from "./questions";
import { batch1 } from "./enrichment-1";
import { batch2 } from "./enrichment-2";
import { batch3 } from "./enrichment-3";

export const cissp: CertPack = {
  id: "cissp",
  name: "CISSP",
  blurb: "Certified Information Systems Security Professional",
  questions: cisspQuestions,
  enrichment: { ...batch1, ...batch2, ...batch3 },
};

