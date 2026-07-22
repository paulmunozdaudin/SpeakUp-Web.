/**
 * Central domain types for SpeakUp.
 * Every feature (recording, analysis, history, profile) builds on these.
 */

/** Practice modes — extensible for future verticals. */
export type PracticeMode =
  | "presentation"
  | "interview"
  | "startup-pitch"
  | "school"
  | "ted-talk"
  | "sales-pitch"
  | "language-exam";

/** A single 0–100 metric returned by the AI analysis. */
export interface MetricScore {
  score: number; // 0–100
  feedback: string;
}

/**
 * Full structured analysis returned by the AI provider.
 * `eyeContact` and `bodyLanguage` are reserved for future video support.
 */
export interface AnalysisResult {
  overallScore: number; // 0–100
  clarity: MetricScore;
  confidence: MetricScore;
  pace: MetricScore & { wordsPerMinute: number };
  structure: MetricScore;
  persuasiveness: MetricScore;
  vocabulary: MetricScore;
  fillerWords: {
    score: number;
    count: number;
    words: { word: string; count: number }[];
  };
  /** Future: video analysis. */
  eyeContact?: MetricScore;
  bodyLanguage?: MetricScore;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  tips: string[];
  nextExercises: string[];
  transcript?: string;
}

/** A saved practice session. */
export interface PracticeSession {
  id: string;
  userId: string;
  topic: string;
  mode: PracticeMode;
  durationSeconds: number;
  createdAt: string; // ISO date
  analysis: AnalysisResult;
}

/** Lightweight row for lists (history, dashboard). */
export type PracticeSessionSummary = Pick<
  PracticeSession,
  "id" | "topic" | "mode" | "durationSeconds" | "createdAt"
> & { overallScore: number };

/** User profile stored in the `profiles` table. */
export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  /** TODO(stripe): replace with real subscription state from Stripe. */
  subscriptionStatus: "free" | "pro";
  createdAt: string;
}

/** Aggregate stats shown on dashboard/profile. */
export interface UserStats {
  totalSessions: number;
  averageScore: number;
  currentStreakDays: number;
  scoreTrend: { date: string; score: number }[];
}
