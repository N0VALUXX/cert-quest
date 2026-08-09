import type { CertPack } from "../../types";
import { netplusQuestions } from "./questions";
import { batch1 } from "./enrichment-1";
import { netplusExercises } from "./exercises";

export const netplus: CertPack = {
  id: "netplus",
  name: "Network+",
  blurb: "CompTIA Network+ (N10-009)",
  questions: netplusQuestions,
  enrichment: { ...batch1 },
  exercises: netplusExercises,
};
