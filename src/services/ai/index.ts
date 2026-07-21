import type { AnalysisProvider } from "./provider";
import { MockAnalysisProvider } from "./mock-provider";
import { OpenAIAnalysisProvider } from "./openai-provider";

/**
 * Provider factory (server-side).
 * Falls back to the mock provider until OPENAI_API_KEY is set AND the real
 * pipeline is implemented — flip `USE_OPENAI` when it lands.
 */
const USE_OPENAI = false; // TODO(ai): enable once OpenAIAnalysisProvider is implemented.

export function getAnalysisProvider(): AnalysisProvider {
  const apiKey = process.env.OPENAI_API_KEY;
  if (USE_OPENAI && apiKey) {
    return new OpenAIAnalysisProvider(apiKey);
  }
  return new MockAnalysisProvider();
}

export type { AnalysisProvider, AnalysisRequest } from "./provider";
