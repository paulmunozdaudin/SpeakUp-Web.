import { NextResponse } from "next/server";
import { transcribe, TranscriptionError } from "@/services/ai/transcription";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Vercel rejects function request bodies above ~4.5 MB before they reach
 *  this code; the client records at a low bitrate to stay well under it
 *  and falls back to its live transcript for anything bigger. */
const MAX_AUDIO_BYTES = 4_400_000;
const SUPPORTED_LANGUAGES = new Set(["es", "en", "fr"]);

/**
 * POST /api/transcribe?lang=es
 * Body: the raw recorded audio (Content-Type = the recorder's MIME type).
 * Returns { transcript } — or, on failure, { error, attempts } with
 * OpenAI's status/code per model tried, so the real cause is visible to
 * the client's error reporter and in the server logs.
 */
export async function POST(request: Request) {
  const language = new URL(request.url).searchParams.get("lang") ?? "";
  if (!SUPPORTED_LANGUAGES.has(language)) {
    return NextResponse.json({ error: "Invalid language." }, { status: 400 });
  }

  const mime = request.headers.get("content-type") ?? "audio/webm";
  const buffer = await request.arrayBuffer().catch(() => null);
  if (!buffer || buffer.byteLength === 0) {
    return NextResponse.json({ error: "Missing audio." }, { status: 400 });
  }
  if (buffer.byteLength > MAX_AUDIO_BYTES) {
    return NextResponse.json({ error: "Recording is too large." }, { status: 413 });
  }

  try {
    const audio = new Blob([buffer], { type: mime });
    const { text } = await transcribe(audio, mime, language);
    return NextResponse.json({ transcript: text });
  } catch (err) {
    const attempts = err instanceof TranscriptionError ? err.attempts : [];
    console.error("[transcribe] failed", JSON.stringify({ mime, bytes: buffer.byteLength, attempts }));
    return NextResponse.json(
      { error: "Transcription failed.", attempts },
      { status: 502 },
    );
  }
}
