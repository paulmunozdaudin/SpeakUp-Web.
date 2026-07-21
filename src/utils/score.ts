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

export function scoreLabel(score: number): string {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Great";
  if (score >= 60) return "Good";
  if (score >= 45) return "Fair";
  return "Needs work";
}
