import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

/** OpenAI's own limit on this endpoint. */
const MAX_AUDIO_BYTES = 25 * 1024 * 1024;

const SUPPORTED_LANGUAGES = new Set(["es", "en", "fr"]);

/**
 * POST /api/transcribe
 * Body: multipart/form-data with an "audio" file field and a "language"
 * field (es/en/fr). Transcribes with OpenAI — this is the server-side
 * replacement for the browser's own SpeechRecognition engine, which
 * doesn't exist in Firefox and is unreliable on iOS. The client only
 * needs to record a plain audio blob (MediaRecorder, universally
 * supported) and send it here.
 */
export async function POST(request: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Transcription is not configured." },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const audio = form.get("audio");
  const language = form.get("language");

  if (!(audio instanceof Blob) || audio.size === 0) {
    return NextResponse.json({ error: "Missing audio." }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Recording is too large." }, { status: 413 });
  }
  if (typeof language !== "string" || !SUPPORTED_LANGUAGES.has(language)) {
    return NextResponse.json({ error: "Invalid language." }, { status: 400 });
  }

  try {
    // Whisper infers the container from the filename, not the blob's own
    // MIME type, so the extension has to be set explicitly here.
    const extension = audio.type.includes("mp4") ? "mp4" : "webm";
    const upstreamForm = new FormData();
    upstreamForm.append("file", audio, `recording.${extension}`);
    upstreamForm.append("model", "gpt-4o-transcribe");
    upstreamForm.append("language", language);

    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: upstreamForm,
      signal: AbortSignal.timeout(55_000),
    });

    if (!response.ok) {
      throw new Error(`OpenAI transcription API responded ${response.status}`);
    }

    const payload = await response.json();
    const text = payload?.text;
    if (typeof text !== "string") {
      throw new Error("Empty transcription response");
    }

    return NextResponse.json({ transcript: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Transcription failed.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
