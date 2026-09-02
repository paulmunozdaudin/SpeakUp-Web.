"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import type { PracticeMode, SpeechLanguage, TargetDuration } from "@/types";
import { PRACTICE_MODES } from "@/types";
import { getLocale } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ModeSelector } from "@/components/recording/mode-selector";
import { DurationSelector } from "@/components/recording/duration-selector";
import { LanguageSelector } from "@/components/recording/language-selector";
import { RecorderPanel } from "@/components/recording/recorder-panel";
import { AnalyzingOverlay } from "@/components/recording/analyzing-overlay";
import { analyzeAndSave } from "@/services/analysis.service";
import { useDict } from "@/lib/i18n";

interface SessionConfig {
  mode: PracticeMode;
  title: string;
  topic: string;
  targetDurationMinutes: TargetDuration;
  language: SpeechLanguage;
}

export default function PracticePage() {
  const d = useDict();
  const router = useRouter();
  const [step, setStep] = useState<"setup" | "record">("setup");
  const [config, setConfig] = useState<SessionConfig>(() => ({
    mode: "presentation",
    title: "",
    topic: "",
    targetDurationMinutes: 3,
    // SSR-safe default (matches getServerLocale()) — the server can't see
    // localStorage or the URL, so both are applied for real in the effect
    // below right after mount instead of here.
    language: "en",
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
    const mode = PRACTICE_MODES.includes(modeParam as PracticeMode)
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
  }, []);
  const [titleError, setTitleError] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recorderKey, setRecorderKey] = useState(0);

  function handleContinue() {
    if (!config.title.trim()) {
      setTitleError(true);
      return;
    }
    setStep("record");
  }

  async function handleFinish(transcript: string, durationSeconds: number) {
    if (transcript.trim().split(/\s+/).filter(Boolean).length < 8) {
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
      });
      router.push(`/results/${session.id}`);
    } catch (e) {
      setAnalyzing(false);
      setError(e instanceof Error ? e.message : d.auth.genericError);
      setRecorderKey((k) => k + 1); // remount RecorderPanel back to idle
    }
  }

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
            className="space-y-8"
          >
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                {d.practice.setupTitle}
              </h1>
              <p className="mt-1 text-sm text-muted">{d.practice.setupSubtitle}</p>
            </div>

            <div className="space-y-2">
              <span className="block text-sm font-medium">
                {d.practice.modeLabel}
              </span>
              <ModeSelector
                value={config.mode}
                onChange={(mode) => setConfig((c) => ({ ...c, mode }))}
              />
            </div>

            <Input
              label={d.practice.titleLabel}
              name="title"
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
              label={d.practice.topicLabel}
              name="topic"
              placeholder={d.practice.topicPlaceholder}
              value={config.topic}
              onChange={(event) =>
                setConfig((c) => ({ ...c, topic: event.target.value }))
              }
              maxLength={160}
            />

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <span className="block text-sm font-medium">
                  {d.practice.durationLabel}
                </span>
                <DurationSelector
                  value={config.targetDurationMinutes}
                  onChange={(targetDurationMinutes) =>
                    setConfig((c) => ({ ...c, targetDurationMinutes }))
                  }
                />
              </div>
              <div className="space-y-2">
                <span className="block text-sm font-medium">
                  {d.practice.languageLabel}
                </span>
                <LanguageSelector
                  value={config.language}
                  onChange={(language) =>
                    setConfig((c) => ({ ...c, language }))
                  }
                />
              </div>
            </div>

            <Button size="lg" className="w-full" onClick={handleContinue}>
              {d.practice.continueToRecording}
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
