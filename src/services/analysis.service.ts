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
import { createSession } from "./sessions.service";

export interface AnalyzeInput {
  transcript: string;
  title: string;
  topic: string;
  mode: PracticeMode;
  language: SpeechLanguage;
  durationSeconds: number;
  targetDurationMinutes: number;
}

export async function analyzeAndSave(
  input: AnalyzeInput,
): Promise<PracticeSession> {
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
