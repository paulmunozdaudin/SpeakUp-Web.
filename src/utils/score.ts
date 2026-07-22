/** Score helpers: consistent color-coding across the whole app. */

export type ScoreTone = "success" | "warning" | "danger";

export function scoreTone(score: number): ScoreTone {
  if (score >= 75) return "success";
  if (score >= 50) return "warning";
  return "danger";
}

export const SCORE_TONE_TEXT: Record<ScoreTone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export const SCORE_TONE_STROKE: Record<ScoreTone, string> = {
  success: "stroke-success",
  warning: "stroke-warning",
  danger: "stroke-danger",
};

/** Dictionary key for the qualitative label — resolve via d.scoreLabels[key]. */
export type ScoreLabelKey = "excellent" | "great" | "good" | "fair" | "needsWork";

export function scoreLabelKey(score: number): ScoreLabelKey {
  if (score >= 90) return "excellent";
  if (score >= 75) return "great";
  if (score >= 60) return "good";
  if (score >= 45) return "fair";
  return "needsWork";
}
