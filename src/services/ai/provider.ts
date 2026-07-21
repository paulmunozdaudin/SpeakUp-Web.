import type { AnalysisResult, PracticeMode } from "@/types";

/** Everything an analysis provider needs to evaluate a practice session. */
export interface AnalysisRequest {
  audio: Blob;
  topic: string;
  mode: PracticeMode;
  durationSeconds: number;
}

/**
 * Contract every AI backend must implement.
 * The rest of the app depends only on this interface, so swapping the mock
 * for OpenAI (or any other vendor) is a config change, not a refactor.
 */
export interface AnalysisProvider {
  readonly name: string;
  analyze(request: AnalysisRequest): Promise<AnalysisResult>;
}
