import type { AnalysisResult } from "@/types";
import type { AnalysisProvider, AnalysisRequest } from "./provider";

/**
 * OpenAI-backed analysis provider (server-side only — requires OPENAI_API_KEY).
 *
 * TODO(ai): implement the real pipeline:
 *   1. Transcribe `request.audio` with a speech-to-text model
 *      (e.g. `whisper-1` / `gpt-4o-transcribe`), keeping word timestamps.
 *   2. Compute pace (words/minute) and filler-word counts from the transcript.
 *   3. Send transcript + metadata (topic, mode, duration) to a chat model with
 *      a structured-output JSON schema matching `AnalysisResult`, instructing
 *      it to write all feedback in `request.locale`.
 *   4. Validate the response (zod) and return it.
 *
 * Mode-specific prompts (interview vs. startup pitch vs. TED talk) should be
 * selected from a prompt map keyed by `request.mode`.
 */
export class OpenAIAnalysisProvider implements AnalysisProvider {
  readonly name = "openai";

  constructor(private readonly apiKey: string) {}

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    void this.apiKey;
    void request;
    throw new Error(
      "OpenAI provider not implemented yet — see TODO(ai) in openai-provider.ts",
    );
  }
}
