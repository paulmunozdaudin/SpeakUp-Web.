"use client";

import type { SpeechLanguage } from "@/types";
import { reportClientError } from "@/utils/report-error";

/** Keep in sync with MAX_AUDIO_BYTES in /api/transcribe. */
const MAX_UPLOAD_BYTES = 4_400_000;

/**
 * Transcribes the recorded audio server-side (/api/transcribe). Returns
 * null — never throws — when it can't, so callers always fall back to the
 * browser's live transcript instead of failing the session.
 */
export async function transcribeRecording(
  audio: Blob,
  language: SpeechLanguage,
): Promise<string | null> {
  if (audio.size === 0) return null;
  if (audio.size > MAX_UPLOAD_BYTES) {
    reportClientError("transcription", `too large: ${audio.size} bytes (${audio.type})`);
    return null;
  }
  try {
    const response = await fetch(`/api/transcribe?lang=${language}`, {
      method: "POST",
      headers: { "Content-Type": audio.type || "audio/webm" },
      body: audio,
    });
    const body = (await response.json().catch(() => null)) as
      | { transcript?: string; attempts?: unknown }
      | null;
    if (!response.ok || typeof body?.transcript !== "string") {
      reportClientError(
        "transcription",
        `${response.status} ${audio.type} ${audio.size}B ${JSON.stringify(body?.attempts ?? null)}`,
      );
      return null;
    }
    return body.transcript.trim();
  } catch (e) {
    reportClientError("transcription", e instanceof Error ? e.message : String(e));
    return null;
  }
}
