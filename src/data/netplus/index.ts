import type { CertPack } from "../../types";
import { netplusQuestions } from "./questions";
import { batch1 } from "./enrichment-1";

export const netplus: CertPack = {
  id: "netplus",
  name: "Network+",
  blurb: "CompTIA Network+ (N10-009)",
  questions: netplusQuestions,
  enrichment: { ...batch1 },
};
