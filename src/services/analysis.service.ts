"use client";

/**
 * Client-side entry point for running an analysis:
 * sends the real transcript to our API, then persists the session.
 */

import type {
  AnalysisResult,
  PracticeMode,
  PracticeSession,
  SpeechLanguage,
} from "@/types";
import { checkFreeQuota, createSession } from "./sessions.service";

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
}

export async function analyzeAndSave(
  input: AnalyzeInput,
): Promise<PracticeSession> {
  // Checked before spending an OpenAI call — a free-plan user over quota
  // would otherwise pay for (and immediately lose) a full AI analysis
  // before createSession() rejects the insert.
  await checkFreeQuota();

  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Analysis failed. Please try again.");
  }

  const analysis = (await response.json()) as AnalysisResult;

  return createSession({
    topic: input.title,
    mode: input.mode,
    durationSeconds: Math.round(input.durationSeconds),
    analysis,
  });
}
