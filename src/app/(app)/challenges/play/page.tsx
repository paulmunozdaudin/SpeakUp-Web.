"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RefreshCw, Sparkles, Target } from "lucide-react";
import type { ChallengeType, SpeechLanguage } from "@/types";
import { CHALLENGE_TYPES } from "@/types";
import { getLocale, useDict } from "@/lib/i18n";
import {
  challengePrompt,
  challengeRequest,
  challengeText,
  dailyChallenge,
  dailyDoneToday,
  DAILY_BONUS_XP,
  fill,
  isSameChallenge,
  randomChallenge,
  type ChallengePick,
} from "@/lib/challenges";
import { CHALLENGE_ICONS } from "@/components/challenges/challenge-icons";
import { useSessions } from "@/hooks/use-sessions";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/recording/language-selector";
import { RecorderPanel } from "@/components/recording/recorder-panel";
import { AnalyzingOverlay } from "@/components/recording/analyzing-overlay";
import { analyzeAndSave } from "@/services/analysis.service";
import type { PauseEvent } from "@/hooks/use-speech-recorder";
import { reportClientError } from "@/utils/report-error";

/** Same floor as /practice and /api/analyze. */
const MIN_SPEECH_SECONDS = 30;

export default function ChallengePlayPage() {
  const d = useDict();
  const c = d.challenges;
  const router = useRouter();
  const { sessions } = useSessions();

  const [type, setType] = useState<ChallengeType>("improvise");
  const [isDaily, setIsDaily] = useState(false);
  const [pick, setPick] = useState<ChallengePick | null>(null);
  // SSR-safe default; the visitor's real locale is applied after mount.
  const [language, setLanguage] = useState<SpeechLanguage>("en");
  const [step, setStep] = useState<"intro" | "record">("intro");
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recorderKey, setRecorderKey] = useState(0);

  // The challenge comes from the URL (?type=…&daily=1) and the topic is
  // drawn at random — both only knowable in the browser, so resolved after
  // mount rather than during render (keeps SSR and hydration in sync).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const typeParam = params.get("type");
    const today = dailyChallenge();
    const daily = params.get("daily") === "1";
    const resolvedType = CHALLENGE_TYPES.includes(typeParam as ChallengeType)
      ? (typeParam as ChallengeType)
      : today.type;
    /* eslint-disable react-hooks/set-state-in-effect */
    setType(resolvedType);
    setIsDaily(daily && resolvedType === today.type);
    setPick(
      daily && resolvedType === today.type
        ? today
        : randomChallenge(resolvedType),
    );
    setLanguage(getLocale());
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const Icon = CHALLENGE_ICONS[type];
  const typeCopy = c.types[type];

  function anotherOne() {
    if (!pick) return;
    setPick(randomChallenge(type, pick.index));
    // Off the daily one now, so no bonus for this take.
    setIsDaily(false);
    setError(null);
    setRecorderKey((k) => k + 1);
  }

  async function handleFinish(
    transcript: string,
    durationSeconds: number,
    _frames?: unknown,
    pauses?: PauseEvent[],
  ) {
    if (!pick) return;
    if (durationSeconds < MIN_SPEECH_SECONDS) {
      setError(d.practice.tooShort);
      setRecorderKey((k) => k + 1);
      return;
    }
    setError(null);
    setAnalyzing(true);
    try {
      const { title, topic } = challengeRequest(pick, language);
      const daily =
        isDaily &&
        isSameChallenge(pick, dailyChallenge()) &&
        !dailyDoneToday(sessions);
      const session = await analyzeAndSave({
        transcript,
        title,
        topic,
        mode: "challenge",
        language,
        durationSeconds: Math.max(durationSeconds, 1),
        targetDurationMinutes: 1,
        analysisMode: "voice",
        pauses,
        sourceText: challengeText(pick, language) ?? undefined,
        challenge: {
          type: pick.type,
          prompt: challengePrompt(pick, language),
          daily,
        },
      });
      router.push(`/results/${session.id}`);
    } catch (e) {
      setAnalyzing(false);
      reportClientError("analysis", e instanceof Error ? e.message : String(e));
      setError(e instanceof Error ? e.message : d.auth.genericError);
      setRecorderKey((k) => k + 1);
    }
  }

  const text = pick ? challengeText(pick, language) : null;

  return (
    <div className="relative mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        {step === "intro" ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-8"
          >
            <Link
              href="/challenges"
              className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              {c.backToChallenges}
            </Link>

            <div className="flex items-start gap-4">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-white shadow-[0_10px_24px_-8px_var(--accent)]">
                <Icon className="h-7 w-7" />
              </span>
              <div className="min-w-0">
                {isDaily && (
                  <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                    {c.dailyTitle} · {fill(c.dailyBonus, { bonus: DAILY_BONUS_XP })}
                  </p>
                )}
                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  {typeCopy.name}
                </h1>
                <p className="mt-1.5 text-[15px] text-muted">{typeCopy.description}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
              <Target className="mt-0.5 h-4.5 w-4.5 shrink-0 text-accent" />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">{c.goal}: </span>
                {typeCopy.goal}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-muted">
                {d.practice.languageLabel}
              </span>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>

            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-accent/50 bg-accent-soft/40 px-6 py-10 text-center">
              <Sparkles className="h-7 w-7 text-accent" />
              <p className="mt-3 text-lg font-semibold tracking-tight">{c.surprise}</p>
            </div>

            <Button
              size="lg"
              className="h-14 w-full rounded-2xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-base shadow-[0_20px_45px_-16px_var(--accent)] transition-transform hover:-translate-y-0.5"
              onClick={() => setStep("record")}
              disabled={!pick}
            >
              {c.startCta}
              <ArrowRight className="h-4.5 w-4.5" />
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="record"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between gap-3">
              <Link
                href="/challenges"
                className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {c.backToChallenges}
              </Link>
              <button
                type="button"
                onClick={anotherOne}
                disabled={analyzing}
                className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {c.anotherTopic}
              </button>
            </div>

            {pick && (
              <motion.div
                key={`${pick.type}-${pick.index}-${language}`}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative overflow-hidden rounded-3xl border border-accent/50 bg-[linear-gradient(165deg,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_65%)] p-6"
              >
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-accent">
                  <Icon className="h-3.5 w-3.5" />
                  {typeCopy.name} · {text ? c.yourText : c.yourTopic}
                </p>
                <h1 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  {challengePrompt(pick, language)}
                </h1>
                {text && (
                  <p className="mt-4 text-[17px] leading-relaxed sm:text-lg">{text}</p>
                )}
                <p className="mt-4 text-xs text-muted">{c.readyHint}</p>
              </motion.div>
            )}

            <RecorderPanel
              key={recorderKey}
              language={language}
              targetDurationMinutes={1}
              analysisMode="voice"
              onFinish={handleFinish}
              disabled={analyzing}
            />

            {error && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {analyzing && <AnalyzingOverlay />}
    </div>
  );
}
