import type {
  AnalysisMode,
  AnalysisResult,
  PracticeMode,
  SpeechLanguage,
} from "@/types";

/** One sampled video frame, as captured client-side by utils/video-frames. */
export interface AnalysisFrame {
  timestampSeconds: number;
  dataUrl: string;
}

/** Everything an analysis provider needs to evaluate a practice session. */
export interface AnalysisRequest {
  transcript: string;
  title: string;
  topic: string;
  mode: PracticeMode;
  language: SpeechLanguage;
  durationSeconds: number;
  targetDurationMinutes: number;
  analysisMode: AnalysisMode;
  /** Present only when analysisMode is "video" and frame sampling
   *  succeeded. A handful of small JPEG data URLs, never the raw video. */
  frames?: AnalysisFrame[];
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
