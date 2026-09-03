import { NextResponse } from "next/server";
import type { PracticeMode, SpeechLanguage } from "@/types";
import { PRACTICE_MODES } from "@/types";
import { getAnalysisProvider } from "@/services/ai";
import { evaluateBacFrancaisOral } from "@/services/ai/bac-francais-evaluator";

export const runtime = "nodejs";
export const maxDuration = 60; // the LLM call can take a while

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
    (b.textContext === undefined || typeof b.textContext === "string")
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
