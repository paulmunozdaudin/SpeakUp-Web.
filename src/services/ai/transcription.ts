/**
 * Server-side speech-to-text via OpenAI. Shared by /api/transcribe and its
 * founder-only self-test, so both exercise exactly the same code path.
 */

/** Tried in order — if a model is unavailable to this API key/project
 *  (404/403, e.g. a project-level model allowlist), the next one is used. */
export const TRANSCRIPTION_MODELS = ["gpt-4o-mini-transcribe", "whisper-1"] as const;

export interface TranscriptionAttempt {
  model: string;
  status: number;
  /** OpenAI's error code/message, truncated — never the API key. */
  error?: string;
}

export class TranscriptionError extends Error {
  constructor(
    message: string,
    readonly attempts: TranscriptionAttempt[],
  ) {
    super(message);
  }
}

/** OpenAI infers the container from the file extension, not the MIME type,
 *  so the name has to match what the browser actually recorded. */
export function extensionForMime(mime: string): string {
  const type = mime.toLowerCase();
  if (type.includes("mp4") || type.includes("m4a") || type.includes("aac")) return "mp4";
  if (type.includes("ogg")) return "ogg";
  if (type.includes("wav")) return "wav";
  if (type.includes("mpeg") || type.includes("mp3")) return "mp3";
  return "webm";
}

async function attempt(
  apiKey: string,
  model: string,
  audio: Blob,
  filename: string,
  language: string,
): Promise<{ text: string } | TranscriptionAttempt> {
  const form = new FormData();
  form.append("file", audio, filename);
  form.append("model", model);
  form.append("language", language);
  form.append("response_format", "json");

  const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
    signal: AbortSignal.timeout(50_000),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    let detail = body.slice(0, 300);
    try {
      const parsed = JSON.parse(body) as { error?: { code?: string; message?: string } };
      detail = [parsed.error?.code, parsed.error?.message].filter(Boolean).join(": ").slice(0, 300);
    } catch {
      // Non-JSON body — keep the raw (truncated) text.
    }
    return { model, status: response.status, error: detail };
  }

  const payload = (await response.json()) as { text?: unknown };
  return { text: typeof payload.text === "string" ? payload.text : "" };
}

export async function transcribe(
  audio: Blob,
  mime: string,
  language: string,
): Promise<{ text: string; model: string; attempts: TranscriptionAttempt[] }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new TranscriptionError("OPENAI_API_KEY is not configured", []);
  }

  const filename = `recording.${extensionForMime(mime)}`;
  const attempts: TranscriptionAttempt[] = [];
  for (const model of TRANSCRIPTION_MODELS) {
    try {
      const result = await attempt(apiKey, model, audio, filename, language);
      if ("text" in result) return { text: result.text.trim(), model, attempts };
      attempts.push(result);
      console.error("[transcribe] attempt failed", JSON.stringify(result));
      // Only a model-availability/permission problem is worth retrying with
      // another model; a bad file or rate limit would fail the same way.
      if (![403, 404].includes(result.status) && !/model/i.test(result.error ?? "")) break;
    } catch (err) {
      const failed = {
        model,
        status: 0,
        error: err instanceof Error ? err.message.slice(0, 300) : "request failed",
      };
      attempts.push(failed);
      console.error("[transcribe] attempt threw", JSON.stringify(failed));
      break;
    }
  }
  throw new TranscriptionError("Transcription failed", attempts);
}
