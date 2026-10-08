/**
 * Challenge logic: picking topics/texts (random or "today's"), building the
 * title/topic sent to the analyzer, and turning saved challenge sessions
 * into XP, levels and stats for /challenges. Everything is derived from the
 * sessions themselves — no extra table, so it works for guests too.
 */

import type {
  ChallengeType,
  PracticeSession,
  SpeechLanguage,
} from "@/types";
import { CHALLENGE_TYPES } from "@/types";
import { DICTIONARIES } from "@/lib/i18n";
import { CHALLENGE_CONTENT } from "@/lib/challenge-content";
import { computeStats } from "@/services/sessions.service";

/** Extra XP for the first completion of the day's challenge. */
export const DAILY_BONUS_XP = 25;

/** XP needed to reach each level — index matches `challenges.levels` in the
 *  dictionaries. With ~70 XP per challenge, the top level ("Master of
 *  Oratory") takes roughly three months of daily practice. */
export const LEVEL_THRESHOLDS = [0, 300, 800, 1600, 2800, 4500, 7000];

/** A concrete challenge ready to be played: what the user sees, and what
 *  the analyzer receives. */
export interface ChallengePick {
  type: ChallengeType;
  /** Index into the content pool for this type — stable across languages
   *  since every language has the same number of entries. */
  index: number;
}

function pool(type: ChallengeType, language: SpeechLanguage): string[] {
  const content = CHALLENGE_CONTENT[language];
  switch (type) {
    case "reading":
      return content.reading.map((r) => r.title);
    case "explain":
      return content.explain;
    case "story":
      return content.story;
    case "improvise":
    case "noFillers":
      return content.improvise;
  }
}

/** Days since epoch for the user's LOCAL calendar date — so "today's
 *  challenge" flips at the user's midnight, not UTC's. */
function localDayNumber(date: Date): number {
  return Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
}

/** Same challenge for everyone on a given day — rotates through the types
 *  so each weekday feels different. */
export function dailyChallenge(date = new Date()): ChallengePick {
  const day = localDayNumber(date);
  const type = CHALLENGE_TYPES[day % CHALLENGE_TYPES.length];
  const size = pool(type, "en").length;
  return { type, index: (day * 7 + 3) % size };
}

export function randomChallenge(
  type: ChallengeType,
  excludeIndex?: number,
): ChallengePick {
  const size = pool(type, "en").length;
  let index = Math.floor(Math.random() * size);
  if (size > 1 && index === excludeIndex) index = (index + 1) % size;
  return { type, index };
}

export function isSameChallenge(a: ChallengePick, b: ChallengePick): boolean {
  return a.type === b.type && a.index === b.index;
}

/** The surprise prompt shown to the user (topic, or reading text title). */
export function challengePrompt(
  pick: ChallengePick,
  language: SpeechLanguage,
): string {
  return pool(pick.type, language)[pick.index];
}

/** Only for "reading": the full text to read aloud. */
export function challengeText(
  pick: ChallengePick,
  language: SpeechLanguage,
): string | null {
  if (pick.type !== "reading") return null;
  return CHALLENGE_CONTENT[language].reading[pick.index].text;
}

/** Title (shown in history/results) and topic (the analyzer's brief) for a
 *  challenge, written in the speech language so the report matches it. */
export function challengeRequest(
  pick: ChallengePick,
  language: SpeechLanguage,
): { title: string; topic: string } {
  const type = DICTIONARIES[language].challenges.types[pick.type];
  const prompt = challengePrompt(pick, language);
  const text = challengeText(pick, language);
  const goalLabel = DICTIONARIES[language].challenges.goal;
  const topic = text
    ? `${goalLabel}: ${type.goal} — «${text}»`
    : `${goalLabel}: ${type.goal} — ${prompt}`;
  return { title: `${type.name}: ${prompt}`, topic };
}

export function sessionXp(session: PracticeSession): number {
  return (
    session.analysis.overallScore +
    (session.analysis.challenge?.daily ? DAILY_BONUS_XP : 0)
  );
}

export function levelForXp(xp: number) {
  let index = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) index = i;
  }
  const isMax = index === LEVEL_THRESHOLDS.length - 1;
  const current = LEVEL_THRESHOLDS[index];
  const next = isMax ? null : LEVEL_THRESHOLDS[index + 1];
  const progress =
    next === null ? 1 : Math.min(1, (xp - current) / (next - current));
  return { index, isMax, next, progress };
}

export function challengeSessions(
  sessions: PracticeSession[],
): PracticeSession[] {
  return sessions.filter((s) => s.mode === "challenge");
}

/** Whether today's daily challenge bonus has already been claimed. */
export function dailyDoneToday(sessions: PracticeSession[]): boolean {
  const today = new Date().toDateString();
  return sessions.some(
    (s) =>
      s.mode === "challenge" &&
      s.analysis.challenge?.daily &&
      new Date(s.createdAt).toDateString() === today,
  );
}

export function computeChallengeProgress(sessions: PracticeSession[]) {
  const done = challengeSessions(sessions);
  const xp = done.reduce((sum, s) => sum + sessionXp(s), 0);
  const stats = computeStats(done);
  const best = done.reduce((max, s) => Math.max(max, s.analysis.overallScore), 0);
  return {
    sessions: done,
    xp,
    level: levelForXp(xp),
    completed: done.length,
    averageScore: stats.averageScore,
    bestScore: best,
    streakDays: stats.currentStreakDays,
    scoreTrend: stats.scoreTrend,
    dailyDone: dailyDoneToday(done),
  };
}

/** Fills "{key}" placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(values[key] ?? `{${key}}`),
  );
}
