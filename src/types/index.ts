/**
 * Central domain types for Orato AI.
 * Every feature (recording, analysis, history, profile) builds on these.
 */

/** Practice modes — extensible for future verticals. */
export type PracticeMode =
  | "presentation"
  | "startup-pitch"
  | "interview"
  | "oral-exam"
  | "project-defense";

export const PRACTICE_MODES: PracticeMode[] = [
  "presentation",
  "startup-pitch",
  "interview",
  "oral-exam",
  "project-defense",
];

/** Language the user speaks (and the report is written) in. */
export type SpeechLanguage = "es" | "en";

/** Target durations offered in the setup step (minutes). */
export const TARGET_DURATIONS = [1, 3, 5, 10] as const;
export type TargetDuration = (typeof TARGET_DURATIONS)[number];

/** The 13 coaching dimensions every analysis scores 0–100. */
export const METRIC_KEYS = [
  "clarity",
  "confidence",
  "structure",
  "pace",
  "fluency",
  "fillerUsage",
  "sentenceLength",
  "organization",
  "persuasion",
  "naturalness",
  "precision",
  "openingStrength",
  "closingQuality",
] as const;
export type MetricKey = (typeof METRIC_KEYS)[number];

export interface MetricScore {
  score: number; // 0–100
  feedback: string; // written in the session language, references real content
}

export type PaceVerdict = "slow" | "ideal" | "fast";

/** Full structured analysis of one practice session. */
export interface AnalysisResult {
  /** Schema marker + which backend produced the coach layer. */
  version: 2;
  provider: "openai" | "heuristic";
  language: SpeechLanguage;

  overallScore: number; // 0–100
  metrics: Record<MetricKey, MetricScore>;

  wordCount: number;
  wordsPerMinute: number;
  paceVerdict: PaceVerdict;

  fillerWords: {
    total: number;
    perMinute: number;
    top: { word: string; count: number }[];
  };

  structure: {
    hasIntro: boolean;
    hasBody: boolean;
    hasConclusion: boolean;
    commentary: string;
  };

  /** Narrative coach feedback — all reference the actual content. */
  summary: string;
  highlights: string[]; // what works, with specifics
  weaknesses: string[]; // where it gets confusing / loses strength
  recommendations: string[]; // exactly 5 concrete actions

  /** Rewritten version of the speech keeping the original ideas. */
  improvedVersion: string;

  /** 5–10 questions an examiner/investor/interviewer would likely ask. */
  audienceQuestions: string[];

  transcript: string;
}

/** A saved practice session. */
export interface PracticeSession {
  id: string;
  userId: string;
  topic: string; // display title of the session
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
