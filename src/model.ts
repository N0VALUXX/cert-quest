import type { CertPack, Question } from "./content-model";
import type { Attempt, ProgressData } from "./progress";

export interface DomainMetric {
  readonly domain: string;
  readonly total: number;
  readonly seen: number;
  readonly correct: number;
  readonly readiness: number;
  readonly status: "unmapped" | "forming" | "steady" | "strong";
}

export function attemptsForPack(progress: ProgressData, packId: string): readonly Attempt[] {
  return progress.attempts.filter((attempt) => attempt.packId === packId);
}

export function domainMetrics(pack: CertPack, progress: ProgressData): readonly DomainMetric[] {
  const domains = [...new Set(pack.questions.map((question) => question.domain))];
  return domains.map((domain) => {
    const questions = pack.questions.filter((question) => question.domain === domain);
    const latest = latestByQuestion(
      progress.attempts.filter((attempt) => attempt.packId === pack.id && attempt.domain === domain),
    );
    const seen = latest.size;
    const correct = [...latest.values()].filter((attempt) => attempt.correct).length;
    const evidence = questions.length === 0 ? 0 : seen / questions.length;
    const accuracy = seen === 0 ? 0 : correct / seen;
    const readiness = Math.round(100 * accuracy * Math.sqrt(evidence));
    const status: DomainMetric["status"] = readiness >= 80 ? "strong" : readiness >= 60 ? "steady" : readiness > 0 ? "forming" : "unmapped";
    return {
      domain,
      total: questions.length,
      seen,
      correct,
      readiness,
      status,
    };
  }).sort((a, b) => a.readiness - b.readiness || b.total - a.total);
}

export function packReadiness(pack: CertPack, progress: ProgressData): number {
  const metrics = domainMetrics(pack, progress);
  if (metrics.length === 0) return 0;
  const weighted = metrics.reduce((sum, metric) => sum + metric.readiness * metric.total, 0);
  const total = metrics.reduce((sum, metric) => sum + metric.total, 0);
  return total === 0 ? 0 : Math.round(weighted / total);
}

export function studyQueue(pack: CertPack, progress: ProgressData, limit = 10): readonly Question[] {
  const latest = latestByQuestion(attemptsForPack(progress, pack.id));
  const metrics = new Map(domainMetrics(pack, progress).map((metric) => [metric.domain, metric.readiness]));
  return [...pack.questions]
    .sort((a, b) => {
      const aAttempt = latest.get(a.id);
      const bAttempt = latest.get(b.id);
      const score = (question: Question, attempt: Attempt | undefined): number => {
        const weakness = 100 - (metrics.get(question.domain) ?? 0);
        if (attempt === undefined) return 200 + weakness;
        const ageDays = (Date.now() - attempt.occurredAt) / 86_400_000;
        return (attempt.correct ? 0 : 300) + weakness + Math.min(ageDays, 30);
      };
      return score(b, bAttempt) - score(a, aAttempt);
    })
    .slice(0, limit);
}

export function daysUntil(date: string | undefined): number | null {
  if (date === undefined || date === "") return null;
  const end = new Date(`${date}T12:00:00`).getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}

function latestByQuestion(attempts: readonly Attempt[]): Map<string, Attempt> {
  const result = new Map<string, Attempt>();
  for (const attempt of attempts) {
    const current = result.get(attempt.questionId);
    if (current === undefined || current.occurredAt < attempt.occurredAt) {
      result.set(attempt.questionId, attempt);
    }
  }
  return result;
}
