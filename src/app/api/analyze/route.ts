import { NextResponse } from "next/server";
import type { AnalysisMode, PracticeMode, SpeechLanguage } from "@/types";
import { PRACTICE_MODES } from "@/types";
import { getAnalysisProvider } from "@/services/ai";
import type { AnalysisFrame } from "@/services/ai/provider";
import { evaluateBacFrancaisOral } from "@/services/ai/bac-francais-evaluator";

export const runtime = "nodejs";
export const maxDuration = 60; // the LLM call can take a while

/** Frames are small (downscaled to 480px wide, JPEG) but this still bounds
 *  the request body against an abusive/buggy client sending too many. */
const MAX_FRAMES = 12;

interface PauseEventInput {
  timestampSeconds: number;
  durationSeconds: number;
}

interface AnalyzeBody {
  transcript: string;
  title: string;
  topic: string;
  mode: PracticeMode;
  language: SpeechLanguage;
  durationSeconds: number;
  targetDurationMinutes: number;
  /** The text/reference a Bac de Français oral is being examined on —
   *  triggers the dedicated literary-analysis evaluation on top of the
   *  generic one. Unused for every other mode. */
  textContext?: string;
  analysisMode: AnalysisMode;
  frames?: AnalysisFrame[];
  /** Long mid-speech silences, timestamped client-side from the real mic
   *  signal (see use-speech-recorder's audio monitor) — not AI-derived. */
  pauses?: PauseEventInput[];
}

/** Bounds the request body against an abusive/buggy client; a real
 *  presentation only produces a handful of these. */
const MAX_PAUSE_EVENTS = 60;

function isValidFrame(value: unknown): value is AnalysisFrame {
  if (!value || typeof value !== "object") return false;
  const f = value as Record<string, unknown>;
  return (
    typeof f.timestampSeconds === "number" &&
    typeof f.dataUrl === "string" &&
    f.dataUrl.startsWith("data:image/")
  );
}

function isValidPauseEvent(value: unknown): value is PauseEventInput {
  if (!value || typeof value !== "object") return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.timestampSeconds === "number" &&
    p.timestampSeconds >= 0 &&
    typeof p.durationSeconds === "number" &&
    p.durationSeconds > 0
  );
}

function isValidBody(body: unknown): body is AnalyzeBody {
  if (!body || typeof body !== "object") return false;
  const b = body as Record<string, unknown>;
  return (
    typeof b.transcript === "string" &&
    b.transcript.trim().length > 0 &&
    typeof b.title === "string" &&
    typeof b.topic === "string" &&
    typeof b.mode === "string" &&
    PRACTICE_MODES.includes(b.mode as PracticeMode) &&
    (b.language === "es" || b.language === "en" || b.language === "fr") &&
    typeof b.durationSeconds === "number" &&
    typeof b.targetDurationMinutes === "number" &&
    (b.textContext === undefined || typeof b.textContext === "string") &&
    (b.analysisMode === "voice" || b.analysisMode === "video") &&
    (b.frames === undefined ||
      (Array.isArray(b.frames) &&
        b.frames.length <= MAX_FRAMES &&
        b.frames.every(isValidFrame))) &&
    (b.pauses === undefined ||
      (Array.isArray(b.pauses) &&
        b.pauses.length <= MAX_PAUSE_EVENTS &&
        b.pauses.every(isValidPauseEvent)))
  );
}

/**
 * POST /api/analyze
 * Body: JSON { transcript, title, topic, mode, language, durationSeconds,
 * targetDurationMinutes }. The transcript comes from the browser's live
 * speech-to-text — this endpoint never touches raw audio.
 * Returns: AnalysisResult (JSON).
 *
 * Runs server-side so the OpenAI key never reaches the browser.
 */
export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    if (!isValidBody(body)) {
      return NextResponse.json(
        {
          error:
            "Invalid request: transcript, title, topic, mode, language, durationSeconds and targetDurationMinutes are required.",
        },
        { status: 400 },
      );
    }

    if (body.transcript.trim().split(/\s+/).length < 8) {
      return NextResponse.json(
        {
          error:
            "The recording was too short to analyze. Speak for at least a few sentences.",
        },
        { status: 422 },
      );
    }

    const provider = getAnalysisProvider();
    const analysis = await provider.analyze(body);

    // Deterministic pass-through, not an AI judgment — the browser already
    // measured these from the real mic signal (use-speech-recorder's audio
    // monitor). Omitted entirely (not a zeroed-out object) when the client
    // couldn't measure it, same "never fabricate" rule as `video`.
    if (body.pauses !== undefined) {
      analysis.pauses = {
        count: body.pauses.length,
        longestSeconds:
          body.pauses.length > 0
            ? Math.max(...body.pauses.map((p) => p.durationSeconds))
            : 0,
        totalSeconds:
          Math.round(body.pauses.reduce((sum, p) => sum + p.durationSeconds, 0) * 10) / 10,
        events: body.pauses,
      };
    }

    if (body.mode === "bac-francais-oral" && body.textContext?.trim()) {
      analysis.sourceText = body.textContext.trim();
      analysis.bacFrancais = await evaluateBacFrancaisOral({
        textContext: body.textContext.trim(),
        transcript: body.transcript,
        language: body.language,
        durationSeconds: body.durationSeconds,
        targetDurationMinutes: body.targetDurationMinutes,
      });
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[api/analyze] analysis failed:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
