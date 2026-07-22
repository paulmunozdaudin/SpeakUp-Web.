import type { AnalysisProvider } from "./provider";
import { HeuristicAnalysisProvider } from "./heuristic-provider";
import { OpenAIAnalysisProvider } from "./openai-provider";

/**
 * Provider factory (server-side).
 * Uses OpenAI when OPENAI_API_KEY is set; otherwise falls back to the
 * heuristic provider, which computes real scores from the transcript
 * without any external API — the product works end-to-end either way.
 */
export function getAnalysisProvider(): AnalysisProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (apiKey) {
    return new OpenAIAnalysisProvider(apiKey);
  }
  return new HeuristicAnalysisProvider();
}

export type { AnalysisProvider, AnalysisRequest } from "./provider";
