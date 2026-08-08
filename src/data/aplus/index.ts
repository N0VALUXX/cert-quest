import type { CertPack } from "../../types";
import { aplusQuestions } from "./questions";
import { batch1 } from "./enrichment-1";

export const aplus: CertPack = {
  id: "aplus",
  name: "A+",
  blurb: "CompTIA A+ (220-1201 / 220-1202)",
  questions: aplusQuestions,
  enrichment: { ...batch1 },
};
