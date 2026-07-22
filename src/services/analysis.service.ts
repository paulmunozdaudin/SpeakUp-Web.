"use client";

/**
 * Client-side entry point for running an analysis:
 * uploads the recording to our API, then persists the session.
 */

import type { AnalysisResult, PracticeMode, PracticeSession } from "@/types";
import { getLocale } from "@/lib/i18n";
import { createSession } from "./sessions.service";

export interface AnalyzeInput {
  audio: Blob;
  topic: string;
  mode: PracticeMode;
  durationSeconds: number;
}

export async function analyzeAndSave(
  input: AnalyzeInput,
): Promise<PracticeSession> {
  const form = new FormData();
  form.append("audio", input.audio);
  form.append("topic", input.topic);
  form.append("mode", input.mode);
  form.append("durationSeconds", String(Math.round(input.durationSeconds)));
  // The AI writes its feedback in the user's current language.
  form.append("locale", getLocale());

  const response = await fetch("/api/analyze", { method: "POST", body: form });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Analysis failed. Please try again.");
  }

  const analysis = (await response.json()) as AnalysisResult;

  return createSession({
    topic: input.topic,
    mode: input.mode,
    durationSeconds: Math.round(input.durationSeconds),
    analysis,
  });
}
