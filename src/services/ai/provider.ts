import type {
  AnalysisResult,
  PracticeMode,
  SpeechLanguage,
} from "@/types";

/** Everything an analysis provider needs to evaluate a practice session. */
export interface AnalysisRequest {
  transcript: string;
  title: string;
  topic: string;
  mode: PracticeMode;
  language: SpeechLanguage;
  durationSeconds: number;
  targetDurationMinutes: number;
}

/**
 * Contract every AI backend must implement.
 * The rest of the app depends only on this interface, so swapping backends
 * (heuristic today, OpenAI when a key is present) is a config change.
 */
export interface AnalysisProvider {
  readonly name: string;
  analyze(request: AnalysisRequest): Promise<AnalysisResult>;
}
