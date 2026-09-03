import type { MetricKey, PracticeSession } from "@/types";
import { METRIC_KEYS } from "@/types";

export type ReadinessTier = "notReady" | "gettingThere" | "ready" | "veryReady";

export interface ExamModeProgress {
  /** Up to the 3 weakest metrics right now — what "Suis-je prêt ?" should
   *  tell the student to work on before the real exam. */
  readinessScore: number; // 0-100, same scale as overallScore
  readinessTier: ReadinessTier;
  priorityMetrics: MetricKey[];
  /** Metrics that stay weak (<60) averaged across the last few sessions —
   *  a genuine pattern, not a one-off bad take. */
  recurringWeakMetrics: MetricKey[];
  recurringFillers: { word: string; count: number }[];
}

/** How many recent sessions feed "is this a pattern" detection. */
const RECENT_WINDOW = 5;
/** How many recent sessions feed the current readiness estimate. */
const READINESS_WINDOW = 3;
const WEAK_METRIC_THRESHOLD = 60;

function tierFor(score: number): ReadinessTier {
  if (score >= 85) return "veryReady";
  if (score >= 65) return "ready";
  if (score >= 45) return "gettingThere";
  return "notReady";
}

/**
 * Derives readiness + recurring-error insights for one exam mode from that
 * student's session history — no extra storage needed, everything is
 * recomputed from the same `analysis` already saved per session.
 */
export function computeExamProgress(sessionsNewestFirst: PracticeSession[]): ExamModeProgress {
  const forReadiness = sessionsNewestFirst.slice(0, READINESS_WINDOW);
  const readinessScore = Math.round(
    forReadiness.reduce((sum, s) => sum + s.analysis.overallScore, 0) / forReadiness.length,
  );

  const forErrors = sessionsNewestFirst.slice(0, RECENT_WINDOW);
  const averages = {} as Record<MetricKey, number>;
  for (const key of METRIC_KEYS) {
    averages[key] =
      forErrors.reduce((sum, s) => sum + s.analysis.metrics[key].score, 0) / forErrors.length;
  }
  const recurringWeakMetrics = METRIC_KEYS.filter((key) => averages[key] < WEAK_METRIC_THRESHOLD).sort(
    (a, b) => averages[a] - averages[b],
  );

  const fillerCounts = new Map<string, number>();
  for (const session of forErrors) {
    for (const filler of session.analysis.fillerWords.top) {
      fillerCounts.set(filler.word, (fillerCounts.get(filler.word) ?? 0) + filler.count);
    }
  }
  const recurringFillers = [...fillerCounts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  return {
    readinessScore,
    readinessTier: tierFor(readinessScore),
    priorityMetrics: recurringWeakMetrics.slice(0, 3),
    recurringWeakMetrics,
    recurringFillers,
  };
}
