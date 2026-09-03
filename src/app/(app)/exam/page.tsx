"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Award, BookMarked, BookOpen, GraduationCap, LineChart, Loader2 } from "lucide-react";
import type { SpeechLanguage, TargetDuration } from "@/types";
import { useDict } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DurationSelector } from "@/components/recording/duration-selector";
import { LanguageSelector } from "@/components/recording/language-selector";
import { RecorderPanel } from "@/components/recording/recorder-panel";
import { AnalyzingOverlay } from "@/components/recording/analyzing-overlay";
import { analyzeAndSave } from "@/services/analysis.service";
import { AUDIENCE_QUESTIONS } from "@/services/ai/question-bank";
import { cn } from "@/utils/cn";

const EXAM_MODES = ["brevet-oral", "bac-francais-oral", "grand-oral"] as const;
type ExamMode = (typeof EXAM_MODES)[number];

const EXAM_ICONS: Record<ExamMode, typeof BookOpen> = {
  "brevet-oral": BookOpen,
  "bac-francais-oral": BookMarked,
  "grand-oral": Award,
};

/** Suggested presentation length per exam type — close to the real exam's
 *  exposé duration, but always adjustable via the duration selector. */
const DEFAULT_PRESENTATION_MINUTES: Record<ExamMode, TargetDuration> = {
  "brevet-oral": 5,
  "bac-francais-oral": 5,
  "grand-oral": 10,
};

/** How many jury follow-up questions come after the presentation. */
const INTERVIEW_QUESTIONS = 3;
const PER_TURN_TARGET_MINUTES: TargetDuration = 1;

interface Turn {
  question: string;
  answer: string;
  durationSeconds: number;
}

function isExamMode(value: string | null): value is ExamMode {
  return !!value && (EXAM_MODES as readonly string[]).includes(value);
}

function fallbackQuestion(
  mode: ExamMode,
  language: SpeechLanguage,
  topic: string,
  historyLength: number,
) {
  const bank = AUDIENCE_QUESTIONS[language][mode];
  return bank[historyLength % bank.length].replace("{topic}", topic || "");
}

/**
 * "Mode Examinateur IA" — a realistic simulation of the three French oral
 * exams, matching their actual structure: the student first gives their
 * full presentation uninterrupted (exposé), then the jury asks follow-up
 * questions grounded in what was actually said, before the whole exchange
 * goes through the same analysis pipeline as every other session.
 */
export default function ExamModePage() {
  const d = useDict();
  const router = useRouter();

  const [step, setStep] = useState<"setup" | "presentation" | "interview">("setup");
  const [mode, setMode] = useState<ExamMode>("brevet-oral");
  const [topic, setTopic] = useState("");
  const [topicError, setTopicError] = useState(false);
  const [language, setLanguage] = useState<SpeechLanguage>("fr");
  const [presentationMinutes, setPresentationMinutes] = useState<TargetDuration>(
    DEFAULT_PRESENTATION_MINUTES["brevet-oral"],
  );

  // Deep links from the "PRÉPARE TON ORAL" landing section preselect the
  // exam type/language; applied post-mount for the same SSR-safety reason
  // as the generic /practice page (window/localStorage aren't visible server-side).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const langParam = params.get("lang");
    const nextLanguage: SpeechLanguage =
      langParam === "es" || langParam === "en" || langParam === "fr" ? langParam : "fr";
    if (isExamMode(modeParam)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMode(modeParam);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresentationMinutes(DEFAULT_PRESENTATION_MINUTES[modeParam]);
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(nextLanguage);
  }, []);

  const [presentationTranscript, setPresentationTranscript] = useState("");
  const [presentationDurationSeconds, setPresentationDurationSeconds] = useState(0);
  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [recorderKey, setRecorderKey] = useState(0);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleModeChange(next: ExamMode) {
    setMode(next);
    setPresentationMinutes(DEFAULT_PRESENTATION_MINUTES[next]);
  }

  function handleStart() {
    if (!topic.trim()) {
      setTopicError(true);
      return;
    }
    setError(null);
    setPresentationTranscript("");
    setPresentationDurationSeconds(0);
    setTurns([]);
    setRecorderKey((k) => k + 1);
    setStep("presentation");
  }

  async function requestNextQuestion(presentation: string, history: Turn[]) {
    try {
      const response = await fetch("/api/exam/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, language, topic: topic.trim(), presentation, history }),
      });
      const body = await response.json().catch(() => null);
      if (response.ok && typeof body?.question === "string" && body.question.trim()) {
        return body.question as string;
      }
    } catch {
      // fall through to the local fallback below
    }
    return fallbackQuestion(mode, language, topic.trim(), history.length);
  }

  async function handlePresentationFinish(transcript: string, durationSeconds: number) {
    if (transcript.trim().split(/\s+/).filter(Boolean).length < 20) {
      setError(d.practice.tooShort);
      setRecorderKey((k) => k + 1);
      return;
    }
    setError(null);
    setPresentationTranscript(transcript);
    setPresentationDurationSeconds(durationSeconds);
    setLoadingNextQuestion(true);
    const question = await requestNextQuestion(transcript, []);
    setCurrentQuestion(question);
    setQuestionNumber(1);
    setRecorderKey((k) => k + 1);
    setLoadingNextQuestion(false);
    setStep("interview");
  }

  async function finishExam(finalTurns: Turn[]) {
    setAnalyzing(true);
    const interviewTranscript = finalTurns
      .map((t) => `${d.examMode.examinerAsks} ${t.question}\n${t.answer}`)
      .join("\n\n");
    const transcript = `[${d.examMode.presentationSectionLabel}]\n${presentationTranscript}\n\n[${d.examMode.interviewSectionLabel}]\n${interviewTranscript}`;
    const totalDuration =
      presentationDurationSeconds + finalTurns.reduce((sum, t) => sum + t.durationSeconds, 0);

    try {
      const session = await analyzeAndSave({
        transcript,
        title: `${d.modes[mode]} — ${topic.trim()}`,
        topic: topic.trim(),
        mode,
        language,
        durationSeconds: Math.max(totalDuration, 1),
        targetDurationMinutes: presentationMinutes + INTERVIEW_QUESTIONS * PER_TURN_TARGET_MINUTES,
      });
      router.push(`/results/${session.id}`);
    } catch (e) {
      setAnalyzing(false);
      setError(e instanceof Error ? e.message : d.auth.genericError);
    }
  }

  async function handleInterviewTurnFinish(transcript: string, durationSeconds: number) {
    if (transcript.trim().split(/\s+/).filter(Boolean).length < 4) {
      setError(d.practice.tooShort);
      setRecorderKey((k) => k + 1);
      return;
    }
    setError(null);
    const nextTurns = [...turns, { question: currentQuestion, answer: transcript, durationSeconds }];
    setTurns(nextTurns);

    if (nextTurns.length >= INTERVIEW_QUESTIONS) {
      await finishExam(nextTurns);
      return;
    }

    setLoadingNextQuestion(true);
    const question = await requestNextQuestion(presentationTranscript, nextTurns);
    setCurrentQuestion(question);
    setQuestionNumber((n) => n + 1);
    setRecorderKey((k) => k + 1);
    setLoadingNextQuestion(false);
  }

  const Icon = EXAM_ICONS[mode];

  return (
    <div className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        {step === "setup" && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-accent">
                  <GraduationCap className="h-5 w-5" />
                  <span className="text-sm font-semibold uppercase tracking-wide">
                    {d.examMode.examinerBadge}
                  </span>
                </div>
                <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
                  {d.examMode.setupTitle}
                </h1>
                <p className="mt-1.5 text-sm text-muted">{d.examMode.setupSubtitle}</p>
              </div>
              <Link
                href="/exam/progress"
                className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap text-sm font-medium text-accent hover:underline"
              >
                <LineChart className="h-4 w-4" />
                {d.examMode.progressPageTitle}
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {EXAM_MODES.map((m) => {
                const ModeIcon = EXAM_ICONS[m];
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleModeChange(m)}
                    className={cn(
                      "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border p-4 text-center text-xs font-medium transition-colors",
                      mode === m
                        ? "border-accent bg-accent-soft text-accent"
                        : "border-border bg-surface text-muted hover:text-foreground",
                    )}
                  >
                    <ModeIcon className="h-5 w-5" />
                    {d.modes[m]}
                  </button>
                );
              })}
            </div>

            <Input
              label={d.examMode.topicLabel[mode]}
              name="topic"
              placeholder={d.examMode.topicPlaceholder[mode]}
              value={topic}
              onChange={(event) => {
                setTopic(event.target.value);
                if (event.target.value.trim()) setTopicError(false);
              }}
              error={topicError ? d.practice.titleRequired : undefined}
              maxLength={200}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="block text-sm font-medium">{d.practice.durationLabel}</span>
                <DurationSelector value={presentationMinutes} onChange={setPresentationMinutes} />
              </div>
              <div className="space-y-2">
                <span className="block text-sm font-medium">{d.practice.languageLabel}</span>
                <LanguageSelector value={language} onChange={setLanguage} />
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleStart}>
              {d.examMode.startExam}
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted">
              {d.examMode.disclaimer}
            </p>
          </motion.div>
        )}

        {step === "presentation" && (
          <motion.div
            key="presentation"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep("setup")}
                disabled={loadingNextQuestion}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                {d.practice.backToSetup}
              </button>
            </div>

            <div>
              <div className="flex items-center gap-2 text-accent">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {d.examMode.presentationSectionLabel}
                </span>
              </div>
              <h2 className="mt-1 text-lg font-semibold tracking-tight">
                {d.examMode.presentationStepSubtitle}
              </h2>
              <p className="mt-1 text-sm text-muted">{topic}</p>
            </div>

            {loadingNextQuestion ? (
              <div className="flex items-center gap-2 rounded-3xl border border-accent/30 bg-accent-soft p-5 text-sm text-accent">
                <Loader2 className="h-4 w-4 animate-spin" />
                {d.examMode.movingToInterview}
              </div>
            ) : (
              <RecorderPanel
                key={recorderKey}
                language={language}
                targetDurationMinutes={presentationMinutes}
                onFinish={handlePresentationFinish}
                disabled={analyzing}
              />
            )}

            {error && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
            )}
          </motion.div>
        )}

        {step === "interview" && (
          <motion.div
            key="interview"
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-accent">
                {d.examMode.interviewSectionLabel}
              </span>
              <span className="text-xs font-medium tabular-nums text-muted">
                {d.examMode.questionProgress
                  .replace("{current}", String(questionNumber))
                  .replace("{total}", String(INTERVIEW_QUESTIONS))}
              </span>
            </div>

            <div className="rounded-3xl border border-accent/30 bg-accent-soft p-5">
              <div className="flex items-center gap-2 text-accent">
                <Icon className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {d.examMode.examinerAsks}
                </span>
              </div>
              {loadingNextQuestion ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {d.examMode.examinerThinking}
                </p>
              ) : (
                <p className="mt-2 text-base font-medium leading-relaxed">{currentQuestion}</p>
              )}
            </div>

            {!loadingNextQuestion && (
              <RecorderPanel
                key={recorderKey}
                language={language}
                targetDurationMinutes={PER_TURN_TARGET_MINUTES}
                onFinish={handleInterviewTurnFinish}
                disabled={analyzing}
              />
            )}

            {error && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
            )}

            {turns.length > 0 && !loadingNextQuestion && (
              <button
                type="button"
                onClick={() => finishExam(turns)}
                disabled={analyzing}
                className="w-full cursor-pointer text-center text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
              >
                {d.examMode.finishNow}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {analyzing && <AnalyzingOverlay />}
    </div>
  );
}
