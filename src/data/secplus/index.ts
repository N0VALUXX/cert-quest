import type { CertPack } from "../../types";
import { secplusQuestions } from "./questions";
import { batch1 } from "./enrichment-1";
import { secplusExercises } from "./exercises";

export const secplus: CertPack = {
  id: "secplus",
  name: "Security+",
  blurb: "CompTIA Security+ (SY0-701)",
  questions: secplusQuestions,
  enrichment: { ...batch1 },
  exercises: secplusExercises,
};
