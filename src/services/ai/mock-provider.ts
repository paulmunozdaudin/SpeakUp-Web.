import type { AnalysisResult } from "@/types";
import type { AnalysisProvider, AnalysisRequest } from "./provider";

/**
 * Mock provider: produces realistic, deterministic-per-input feedback so the
 * whole product loop (practice → analyze → improve) works before the real
 * AI integration lands.
 */

/** Tiny seeded PRNG so the same recording metadata yields the same report. */
function createRandom(seed: number) {
  let state = seed || 1;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export class MockAnalysisProvider implements AnalysisProvider {
  readonly name = "mock";

  async analyze(request: AnalysisRequest): Promise<AnalysisResult> {
    // Simulate model latency so loading states are honest.
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const random = createRandom(
      hashString(request.topic) + Math.round(request.durationSeconds),
    );
    const score = (min: number, max: number) =>
      Math.round(min + random() * (max - min));

    const clarity = score(55, 95);
    const confidence = score(50, 92);
    const pace = score(50, 90);
    const structure = score(55, 95);
    const persuasiveness = score(50, 90);
    const vocabulary = score(55, 92);
    const fillerScore = score(45, 95);
    const overall = Math.round(
      (clarity + confidence + pace + structure + persuasiveness + vocabulary) /
        6,
    );
    const wpm = score(110, 175);
    const fillerCount = Math.max(
      0,
      Math.round(((100 - fillerScore) / 100) * (request.durationSeconds / 10)),
    );

    return {
      overallScore: overall,
      clarity: {
        score: clarity,
        feedback:
          clarity >= 75
            ? "Your articulation is clear and easy to follow. Sentences land cleanly."
            : "Some passages were hard to follow. Slow down on key points and articulate word endings.",
      },
      confidence: {
        score: confidence,
        feedback:
          confidence >= 75
            ? "You sound assured — steady volume and few hesitations."
            : "Hesitations and a falling volume at sentence ends make you sound unsure. Finish sentences with energy.",
      },
      pace: {
        score: pace,
        wordsPerMinute: wpm,
        feedback:
          wpm > 160
            ? `You averaged ${wpm} words per minute — a bit fast. Aim for 130–150 and pause after key ideas.`
            : wpm < 120
              ? `You averaged ${wpm} words per minute — a bit slow. Tighten transitions to keep energy up.`
              : `You averaged ${wpm} words per minute — right in the ideal range.`,
      },
      structure: {
        score: structure,
        feedback:
          structure >= 75
            ? "Clear opening, body and close. Your ideas build on each other logically."
            : "The talk would benefit from a sharper structure: preview your main points early, then close by echoing them.",
      },
      persuasiveness: {
        score: persuasiveness,
        feedback:
          persuasiveness >= 75
            ? "Strong use of evidence and emphasis on benefits."
            : "Add concrete examples or data to back your claims — specifics persuade more than adjectives.",
      },
      vocabulary: {
        score: vocabulary,
        feedback:
          vocabulary >= 75
            ? "Varied, precise word choice appropriate for your audience."
            : "Some repetitive wording. Swap generic verbs (\"do\", \"get\") for more precise alternatives.",
      },
      fillerWords: {
        score: fillerScore,
        count: fillerCount,
        words: [
          { word: "um", count: Math.ceil(fillerCount * 0.4) },
          { word: "like", count: Math.ceil(fillerCount * 0.3) },
          { word: "you know", count: Math.floor(fillerCount * 0.2) },
          { word: "so", count: Math.floor(fillerCount * 0.1) },
        ].filter((w) => w.count > 0),
      },
      summary: `A ${overall >= 75 ? "strong" : "promising"} ${Math.round(
        request.durationSeconds / 60,
      )}-minute practice on “${request.topic}”. Overall you scored ${overall}/100, with ${
        structure >= clarity ? "structure" : "clarity"
      } as your standout strength. Focus next on ${
        fillerScore < 70 ? "reducing filler words" : "pacing your key moments"
      } to reach the next level.`,
      strengths: [
        clarity >= 70 ? "Clear articulation of main ideas" : "Consistent energy throughout",
        structure >= 70 ? "Logical, easy-to-follow structure" : "Natural, conversational tone",
        vocabulary >= 70 ? "Precise and varied vocabulary" : "Good topic command",
      ],
      weaknesses: [
        fillerScore < 80
          ? `${fillerCount} filler words detected`
          : "Occasional monotone stretches",
        pace < 70 ? "Uneven pacing between sections" : "Endings of sentences lose volume",
      ],
      tips: [
        "Pause for a full second after your most important point — silence creates emphasis.",
        "Record your opening 3 times in a row; first impressions drive audience attention.",
        "Replace filler words with a short pause: it feels long to you, natural to listeners.",
      ],
      nextExercises: [
        "60-second elevator pitch on the same topic",
        "Re-deliver only your conclusion, twice as slow",
        "One-breath exercise: one idea per breath, no fillers",
      ],
      /* TODO(ai): real transcript will come from the speech-to-text step. */
      transcript: undefined,
    };
  }
}
