"use client";

/**
 * Transcribes a recorded audio blob server-side (see /api/transcribe) —
 * the universal replacement for each browser's own SpeechRecognition
 * engine, which doesn't exist in Firefox and is unreliable on iOS even
 * with every permission granted. MediaRecorder (which produces the blob
 * this takes) is supported everywhere, so this works the same regardless
 * of browser or device.
 */

import type { SpeechLanguage } from "@/types";

export async function transcribeAudio(
  audio: Blob,
  language: SpeechLanguage,
): Promise<string> {
  const form = new FormData();
  form.append("audio", audio);
  form.append("language", language);

  const response = await fetch("/api/transcribe", {
    method: "POST",
    body: form,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error ?? "Transcription failed. Please try again.");
  }

  const body = await response.json();
  return typeof body?.transcript === "string" ? body.transcript : "";
}
