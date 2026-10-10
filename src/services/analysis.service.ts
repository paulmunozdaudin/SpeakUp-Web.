"use client";

/**
 * Client-side entry point for running an analysis:
 * sends the real transcript to our API, then persists the session.
 */

import type {
  AnalysisMode,
  AnalysisResult,
  ChallengeInfo,
  PracticeMode,
  PracticeSession,
  SpeechLanguage,
} from "@/types";
import type { CapturedFrame } from "@/utils/video-frames";
import type { PauseEvent } from "@/hooks/use-speech-recorder";
import {
  checkFreeQuota,
  createSession,
  isQuotaExempt,
} from "./sessions.service";

export interface AnalyzeInput {
  transcript: string;
  title: string;
  topic: string;
  mode: PracticeMode;
  language: SpeechLanguage;
  durationSeconds: number;
  targetDurationMinutes: number;
  /** Bac de Français only: the text/reference being examined on. */
  textContext?: string;
  analysisMode: AnalysisMode;
  /** Sampled frames from RecorderPanel — only when analysisMode is "video". */
  frames?: CapturedFrame[];
  /** Long mid-speech silences measured live from the mic — real audio
   *  signal, never derived from the transcript. */
  pauses?: PauseEvent[];
  /** Challenges only — saved with the analysis; only its type is sent to
   *  the API (to pick the challenge's rubric). */
  challenge?: ChallengeInfo;
  /** "reading" challenges only: the text that had to be read aloud. */
  sourceText?: string;
}

export async function analyzeAndSave(
  input: AnalyzeInput,
): Promise<PracticeSession> {
  // Checked before spending an OpenAI call — a free-plan user over quota
  // would otherwise pay for (and immediately lose) a full AI analysis
  // before createSession() rejects the insert.
  if (!isQuotaExempt(input.mode)) await checkFreeQuota();

  const { challenge, ...request } = input;
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...request, challengeType: challenge?.type }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Analysis failed. Please try again.");
  }

  const analysis = (await response.json()) as AnalysisResult;
  if (challenge) analysis.challenge = challenge;

  return createSession({
    topic: input.title,
    mode: input.mode,
    durationSeconds: Math.round(input.durationSeconds),
    analysis,
  });
}
