import { NextResponse } from "next/server";
import type { PracticeMode } from "@/types";
import { getAnalysisProvider } from "@/services/ai";
import type { AnalysisLocale } from "@/services/ai/provider";

export const runtime = "nodejs";
export const maxDuration = 60; // transcription + LLM can take a while

/**
 * POST /api/analyze
 * Body: multipart form-data { audio: Blob, topic: string, mode: PracticeMode,
 * durationSeconds: string, locale?: "en" | "es" }.
 * Returns: AnalysisResult (JSON).
 *
 * Runs server-side so AI vendor keys never reach the browser.
 */
export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const audio = form.get("audio");
    const topic = form.get("topic");
    const mode = form.get("mode");
    const durationSeconds = Number(form.get("durationSeconds"));
    const localeRaw = form.get("locale");
    const locale: AnalysisLocale = localeRaw === "es" ? "es" : "en";

    if (
      !(audio instanceof Blob) ||
      typeof topic !== "string" ||
      topic.length === 0 ||
      typeof mode !== "string" ||
      !Number.isFinite(durationSeconds)
    ) {
      return NextResponse.json(
        { error: "Invalid request: audio, topic, mode and durationSeconds are required." },
        { status: 400 },
      );
    }

    const provider = getAnalysisProvider();
    const analysis = await provider.analyze({
      audio,
      topic,
      mode: mode as PracticeMode,
      durationSeconds,
      locale,
    });

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("[api/analyze] analysis failed:", error);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 },
    );
  }
}
