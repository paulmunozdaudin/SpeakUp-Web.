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

/** Total Q&A turns per simulated exam, and the soft per-answer time target. */
const TOTAL_QUESTIONS = 4;
const PER_TURN_TARGET_MINUTES: TargetDuration = 1;

interface Turn {
  question: string;
  answer: string;
  durationSeconds: number;
}

function isExamMode(value: string | null): value is ExamMode {
  return !!value && (EXAM_MODES as readonly string[]).includes(value);
}

function openingQuestion(mode: ExamMode, language: SpeechLanguage, topic: string) {
  const bank = AUDIENCE_QUESTIONS[language][mode];
  return bank[0].replace("{topic}", topic || "");
}

/**
 * "Mode Examinateur IA" — a turn-based oral exam simulation for the three
 * French exam verticals (Brevet, Bac de Français, Grand Oral). Unlike the
 * generic /practice flow (one continuous recording), this asks a question,
 * records the student's spoken answer, then asks a follow-up based on what
 * they actually said — like a real jury probing deeper — before handing the
 * full exchange to the same analysis pipeline as every other session.
 */
export default function ExamModePage() {
  const d = useDict();
  const router = useRouter();

  const [step, setStep] = useState<"setup" | "exam">("setup");
  const [mode, setMode] = useState<ExamMode>("brevet-oral");
  const [topic, setTopic] = useState("");
  const [topicError, setTopicError] = useState(false);
  const [language, setLanguage] = useState<SpeechLanguage>("fr");

  // Deep links from the "PRÉPARE TON ORAL" landing section preselect the
  // exam type/language; applied post-mount for the same SSR-safety reason
  // as the generic /practice page (window/localStorage aren't visible server-side).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const langParam = params.get("lang");
    const nextLanguage: SpeechLanguage =
      langParam === "es" || langParam === "en" || langParam === "fr" ? langParam : "fr";
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (isExamMode(modeParam)) setMode(modeParam);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(nextLanguage);
  }, []);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [recorderKey, setRecorderKey] = useState(0);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleStart() {
    if (!topic.trim()) {
      setTopicError(true);
      return;
    }
    setError(null);
    setTurns([]);
    setQuestionNumber(1);
    setCurrentQuestion(openingQuestion(mode, language, topic.trim()));
    setRecorderKey((k) => k + 1);
    setStep("exam");
  }

  async function finishExam(finalTurns: Turn[]) {
    setAnalyzing(true);
    const transcript = finalTurns
      .map((t) => `${d.examMode.examinerAsks} ${t.question}\n${t.answer}`)
      .join("\n\n");
    const totalDuration = finalTurns.reduce((sum, t) => sum + t.durationSeconds, 0);

    try {
      const session = await analyzeAndSave({
        transcript,
        title: `${d.modes[mode]} — ${topic.trim()}`,
        topic: topic.trim(),
        mode,
        language,
        durationSeconds: Math.max(totalDuration, 1),
        targetDurationMinutes: TOTAL_QUESTIONS * PER_TURN_TARGET_MINUTES,
      });
      router.push(`/results/${session.id}`);
    } catch (e) {
      setAnalyzing(false);
      setError(e instanceof Error ? e.message : d.auth.genericError);
    }
  }

  async function handleTurnFinish(transcript: string, durationSeconds: number) {
    if (transcript.trim().split(/\s+/).filter(Boolean).length < 4) {
      setError(d.practice.tooShort);
      setRecorderKey((k) => k + 1);
      return;
    }
    setError(null);
    const nextTurns = [...turns, { question: currentQuestion, answer: transcript, durationSeconds }];
    setTurns(nextTurns);

    if (nextTurns.length >= TOTAL_QUESTIONS) {
      await finishExam(nextTurns);
      return;
    }

    setLoadingNextQuestion(true);
    try {
      const response = await fetch("/api/exam/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, language, topic: topic.trim(), history: nextTurns }),
      });
      const body = await response.json().catch(() => null);
      const nextQuestion: string =
        response.ok && typeof body?.question === "string"
          ? body.question
          : openingQuestion(mode, language, topic.trim());
      setCurrentQuestion(nextQuestion);
      setQuestionNumber((n) => n + 1);
      setRecorderKey((k) => k + 1);
    } finally {
      setLoadingNextQuestion(false);
    }
  }

  const Icon = EXAM_ICONS[mode];

  return (
    <div className="mx-auto max-w-2xl">
      <AnimatePresence mode="wait">
        {step === "setup" ? (
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
                    onClick={() => setMode(m)}
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

            <div className="space-y-2">
              <span className="block text-sm font-medium">{d.practice.languageLabel}</span>
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>

            <Button size="lg" className="w-full" onClick={handleStart}>
              {d.examMode.startExam}
            </Button>
            <p className="text-center text-xs leading-relaxed text-muted">
              {d.examMode.disclaimer}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="exam"
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
                disabled={analyzing}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                {d.practice.backToSetup}
              </button>
              <span className="text-xs font-medium tabular-nums text-muted">
                {d.examMode.questionProgress
                  .replace("{current}", String(questionNumber))
                  .replace("{total}", String(TOTAL_QUESTIONS))}
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
                onFinish={handleTurnFinish}
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
