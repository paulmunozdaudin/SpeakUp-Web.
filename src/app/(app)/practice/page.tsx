"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  FileText,
  GraduationCap,
  MessageSquare,
  Presentation,
  Sparkles,
  Zap,
} from "lucide-react";
import type {
  AnalysisMode,
  PracticeMode,
  SpeechLanguage,
  TargetDuration,
} from "@/types";
import { GENERIC_PRACTICE_MODES } from "@/types";
import { getLocale } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeSelector } from "@/components/recording/mode-selector";
import { AnalysisModeSelector } from "@/components/recording/analysis-mode-selector";
import { DurationSelector } from "@/components/recording/duration-selector";
import { LanguageSelector } from "@/components/recording/language-selector";
import { RecorderPanel } from "@/components/recording/recorder-panel";
import { AnalyzingOverlay } from "@/components/recording/analyzing-overlay";
import { analyzeAndSave } from "@/services/analysis.service";
import { checkFreeQuota, QuotaExceededError } from "@/services/sessions.service";
import { QuotaExceededNotice } from "@/components/billing/quota-exceeded-notice";
import { useDict } from "@/lib/i18n";
import type { CapturedFrame } from "@/utils/video-frames";
import type { PauseEvent } from "@/hooks/use-speech-recorder";
import { reportClientError } from "@/utils/report-error";

/** Below this, there just isn't enough speech for the AI to say anything
 *  meaningful about clarity, pacing or structure. */
const MIN_SPEECH_SECONDS = 30;

interface SessionConfig {
  mode: PracticeMode;
  title: string;
  topic: string;
  targetDurationMinutes: TargetDuration;
  language: SpeechLanguage;
  analysisMode: AnalysisMode;
}

export default function PracticePage() {
  const d = useDict();
  const router = useRouter();
  // "choose" = the section picker (presentation vs. challenges vs. exams)
  // every "Start practicing" CTA lands on; deep links skip straight to setup.
  const [step, setStep] = useState<"choose" | "setup" | "record">("choose");
  const [config, setConfig] = useState<SessionConfig>(() => ({
    mode: "presentation",
    title: "",
    topic: "",
    targetDurationMinutes: 3,
    // SSR-safe default (matches getServerLocale()) — the server can't see
    // localStorage or the URL, so both are applied for real in the effect
    // below right after mount instead of here.
    language: "en",
    analysisMode: "voice",
  }));

  // Deep links from marketing pages (e.g. ?mode=grand-oral&lang=fr) preselect
  // a mode/language so a visitor lands ready to just hit record; otherwise
  // this falls back to the visitor's stored/browser locale. Applied in an
  // effect (not the initial state) because the server can't see
  // window.location.search or localStorage — computing it up front would
  // desync the SSR markup from the client's first render.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get("mode");
    const langParam = params.get("lang");
    const mode = GENERIC_PRACTICE_MODES.includes(modeParam as PracticeMode)
      ? (modeParam as PracticeMode)
      : null;
    const language: SpeechLanguage =
      langParam === "es" || langParam === "en" || langParam === "fr"
        ? langParam
        : getLocale();
    // Reading the URL/localStorage is exactly the "external platform API"
    // case this rule's own guidance carves out — there's no React state
    // to derive this from, and it can only be known once mounted in the
    // browser.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConfig((c) => ({
      ...c,
      ...(mode ? { mode } : {}),
      language,
    }));
    if (mode || params.get("section") === "presentation") setStep("setup");
  }, []);
  const [titleError, setTitleError] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [recorderKey, setRecorderKey] = useState(0);

  async function handleContinue() {
    if (!config.title.trim()) {
      setTitleError(true);
      return;
    }
    setError(null);
    setQuotaExceeded(false);
    // Checked before the recorder even opens — otherwise a free user over
    // quota would record a full take and pay for an AI analysis that
    // createSession() rejects at the very last step.
    try {
      await checkFreeQuota();
    } catch (e) {
      if (e instanceof QuotaExceededError) {
        setQuotaExceeded(true);
      } else {
        reportClientError("quota-check", e instanceof Error ? e.message : String(e));
        setError(e instanceof Error ? e.message : d.auth.genericError);
      }
      return;
    }
    setStep("record");
  }

  async function handleFinish(
    transcript: string,
    durationSeconds: number,
    frames?: CapturedFrame[],
    pauses?: PauseEvent[],
  ) {
    if (durationSeconds < MIN_SPEECH_SECONDS) {
      setError(d.practice.tooShort);
      setRecorderKey((k) => k + 1); // remount RecorderPanel back to idle
      return;
    }
    setError(null);
    setAnalyzing(true);
    try {
      const session = await analyzeAndSave({
        transcript,
        title: config.title.trim(),
        topic: config.topic.trim(),
        mode: config.mode,
        language: config.language,
        durationSeconds: Math.max(durationSeconds, 1),
        targetDurationMinutes: config.targetDurationMinutes,
        analysisMode: config.analysisMode,
        frames,
        pauses,
      });
      router.push(`/results/${session.id}`);
    } catch (e) {
      setAnalyzing(false);
      reportClientError("analysis", e instanceof Error ? e.message : String(e));
      setError(e instanceof Error ? e.message : d.auth.genericError);
      setRecorderKey((k) => k + 1); // remount RecorderPanel back to idle
    }
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      {step !== "record" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_70%)]"
        />
      )}
      <AnimatePresence mode="wait">
        {step === "choose" ? (
          <motion.div
            key="choose"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-8"
          >
            <div>
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {d.practice.setupEyebrow}
              </span>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {d.practice.chooseTitle}
              </h1>
              <p className="mt-2 text-[15px] text-muted">{d.practice.chooseSubtitle}</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStep("setup")}
                className="group flex cursor-pointer flex-col rounded-3xl border border-border bg-surface p-6 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/50 hover:shadow-[0_18px_45px_-20px_var(--accent)]"
              >
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent-soft text-accent">
                  <Presentation className="h-6 w-6" />
                </span>
                <span className="text-lg font-semibold tracking-tight">
                  {d.practice.sectionPresentationTitle}
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {d.practice.sectionPresentationDescription}
                </span>
                <ArrowRight className="mt-5 h-5 w-5 text-accent transition-transform group-hover:translate-x-1" />
              </button>

              <Link
                href="/challenges"
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-accent/50 bg-[linear-gradient(165deg,color-mix(in_srgb,var(--accent)_14%,transparent),transparent_65%)] p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_18px_45px_-18px_var(--accent)]"
              >
                <span className="absolute right-5 top-5 rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-white">
                  {d.practice.newBadge}
                </span>
                <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-white shadow-[0_8px_20px_-6px_var(--accent)]">
                  <Zap className="h-6 w-6" />
                </span>
                <span className="text-lg font-semibold tracking-tight">
                  {d.practice.sectionChallengesTitle}
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">
                  {d.practice.sectionChallengesDescription}
                </span>
                <ArrowRight className="mt-5 h-5 w-5 text-accent transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <Link
              href="/exam"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-surface px-5 py-4 transition-colors hover:border-accent/40"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-muted text-muted group-hover:text-foreground">
                <GraduationCap className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold">
                  {d.practice.sectionExamTitle}
                </span>
                <span className="block text-xs text-muted">
                  {d.practice.sectionExamDescription}
                </span>
              </span>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
            </Link>
          </motion.div>
        ) : step === "setup" ? (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="space-y-10"
          >
            <div>
              <button
                type="button"
                onClick={() => setStep("choose")}
                className="mb-5 inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
              >
                <ArrowLeft className="h-4 w-4" />
                {d.practice.backToSections}
              </button>
              <span className="mb-4 flex w-fit items-center gap-2 items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {d.practice.setupEyebrow}
              </span>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {d.practice.setupTitle}
              </h1>
              <p className="mt-2 text-[15px] text-muted">{d.practice.setupSubtitle}</p>
            </div>

            <div className="space-y-3">
              <span className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-muted">
                <span className="flex h-5.5 w-5.5 items-center justify-center rounded-md border border-border bg-surface-muted text-[11px] font-bold text-muted">
                  1
                </span>
                {d.practice.analysisModeLabel}
              </span>
              <AnalysisModeSelector
                variant="premium"
                value={config.analysisMode}
                onChange={(analysisMode) => setConfig((c) => ({ ...c, analysisMode }))}
              />
            </div>

            <div className="space-y-3">
              <span className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-muted">
                <span className="flex h-5.5 w-5.5 items-center justify-center rounded-md border border-border bg-surface-muted text-[11px] font-bold text-muted">
                  2
                </span>
                {d.practice.modeLabel}
              </span>
              <ModeSelector
                variant="premium"
                value={config.mode}
                onChange={(mode) => setConfig((c) => ({ ...c, mode }))}
              />
            </div>

            <div className="space-y-3">
              <span className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-muted">
                <span className="flex h-5.5 w-5.5 items-center justify-center rounded-md border border-border bg-surface-muted text-[11px] font-bold text-muted">
                  3
                </span>
                {d.practice.contentSectionLabel}
              </span>
              <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
                <Input
                  name="title"
                  icon={<FileText className="h-4 w-4" />}
                  placeholder={d.practice.titlePlaceholder}
                  value={config.title}
                  onChange={(event) => {
                    setConfig((c) => ({ ...c, title: event.target.value }));
                    if (event.target.value.trim()) setTitleError(false);
                  }}
                  error={titleError ? d.practice.titleRequired : undefined}
                  maxLength={120}
                />
                <Input
                  name="topic"
                  icon={<MessageSquare className="h-4 w-4" />}
                  placeholder={d.practice.topicPlaceholder}
                  value={config.topic}
                  onChange={(event) =>
                    setConfig((c) => ({ ...c, topic: event.target.value }))
                  }
                  maxLength={160}
                />
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2">
              <div className="space-y-3">
                <span className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-muted">
                  <span className="flex h-5.5 w-5.5 items-center justify-center rounded-md border border-border bg-surface-muted text-[11px] font-bold text-muted">
                    4
                  </span>
                  {d.practice.durationLabel}
                </span>
                <DurationSelector
                  variant="premium"
                  value={config.targetDurationMinutes}
                  onChange={(targetDurationMinutes) =>
                    setConfig((c) => ({ ...c, targetDurationMinutes }))
                  }
                />
              </div>
              <div className="space-y-3">
                <span className="flex items-center gap-2.5 text-sm font-semibold uppercase tracking-wide text-muted">
                  <span className="flex h-5.5 w-5.5 items-center justify-center rounded-md border border-border bg-surface-muted text-[11px] font-bold text-muted">
                    5
                  </span>
                  {d.practice.languageLabel}
                </span>
                <LanguageSelector
                  variant="premium"
                  value={config.language}
                  onChange={(language) =>
                    setConfig((c) => ({ ...c, language }))
                  }
                />
              </div>
            </div>

            <Button
              size="lg"
              className="h-14 w-full rounded-2xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-base shadow-[0_20px_45px_-16px_var(--accent)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-14px_var(--accent)]"
              onClick={handleContinue}
            >
              {d.practice.startPracticeCta}
              <ArrowRight className="h-4.5 w-4.5" />
            </Button>
            {quotaExceeded && <QuotaExceededNotice />}
            {error && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            )}
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
            </div>

            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                {config.title}
              </h1>
              {config.topic && (
                <p className="mt-1 text-sm text-muted">{config.topic}</p>
              )}
            </div>

            <RecorderPanel
              key={recorderKey}
              language={config.language}
              targetDurationMinutes={config.targetDurationMinutes}
              analysisMode={config.analysisMode}
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
