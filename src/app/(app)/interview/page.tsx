"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Briefcase, Building2, Loader2, Sparkles, User } from "lucide-react";
import type { SpeechLanguage, TargetDuration } from "@/types";
import { getLocale, useDict } from "@/lib/i18n";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/recording/language-selector";
import { RecorderPanel } from "@/components/recording/recorder-panel";
import { AnalyzingOverlay } from "@/components/recording/analyzing-overlay";
import { analyzeAndSave } from "@/services/analysis.service";
import { checkFreeQuota, QuotaExceededError } from "@/services/sessions.service";
import { AUDIENCE_QUESTIONS } from "@/services/ai/question-bank";
import { QuotaExceededNotice } from "@/components/billing/quota-exceeded-notice";

/** How many questions make up one mock interview. */
const TOTAL_QUESTIONS = 5;
const PER_TURN_TARGET_MINUTES: TargetDuration = 1;

interface Turn {
  question: string;
  answer: string;
  durationSeconds: number;
}

function fallbackQuestion(language: SpeechLanguage, historyLength: number) {
  const bank = AUDIENCE_QUESTIONS[language].interview;
  return bank[historyLength % bank.length];
}

/**
 * "Mode Entrevistador IA" — a turn-based mock job interview: the AI asks a
 * question, the candidate answers out loud, and the next question is
 * grounded in what they actually said (via OpenAI when configured) — like
 * a real hiring manager probing an answer, not a fixed script.
 */
export default function InterviewModePage() {
  const d = useDict();
  const router = useRouter();

  const [step, setStep] = useState<"setup" | "interview">("setup");
  const [role, setRole] = useState("");
  const [roleError, setRoleError] = useState(false);
  const [company, setCompany] = useState("");
  const [language, setLanguage] = useState<SpeechLanguage>("en");

  // SSR-safe default, corrected post-mount — the server can't see
  // localStorage, so the real stored/browser locale is applied here,
  // same pattern used by /practice and /exam.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLanguage(getLocale());
  }, []);

  const [turns, setTurns] = useState<Turn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionNumber, setQuestionNumber] = useState(1);
  const [recorderKey, setRecorderKey] = useState(0);
  const [loadingNextQuestion, setLoadingNextQuestion] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  async function handleStart() {
    if (!role.trim()) {
      setRoleError(true);
      return;
    }
    setError(null);
    setQuotaExceeded(false);
    // Checked before recording even opens — a full mock interview (5
    // OpenAI-generated follow-ups) would otherwise be wasted on a free user
    // already over quota, only to fail at the very last step.
    try {
      await checkFreeQuota();
    } catch (e) {
      if (e instanceof QuotaExceededError) {
        setQuotaExceeded(true);
      } else {
        setError(e instanceof Error ? e.message : d.auth.genericError);
      }
      return;
    }
    setTurns([]);
    setQuestionNumber(1);
    setCurrentQuestion(fallbackQuestion(language, 0));
    setRecorderKey((k) => k + 1);
    setStep("interview");
  }

  async function requestNextQuestion(history: Turn[]) {
    try {
      const response = await fetch("/api/interview/next-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language,
          role: role.trim(),
          company: company.trim() || undefined,
          history,
        }),
      });
      const body = await response.json().catch(() => null);
      if (response.ok && typeof body?.question === "string" && body.question.trim()) {
        return body.question as string;
      }
    } catch {
      // fall through to the local fallback below
    }
    return fallbackQuestion(language, history.length);
  }

  async function finishInterview(finalTurns: Turn[]) {
    setAnalyzing(true);
    const transcript = finalTurns
      .map((t) => `${d.interviewMode.interviewerAsks} ${t.question}\n${t.answer}`)
      .join("\n\n");
    const totalDuration = finalTurns.reduce((sum, t) => sum + t.durationSeconds, 0);
    const title = company.trim()
      ? `${d.modes.interview} — ${role.trim()} @ ${company.trim()}`
      : `${d.modes.interview} — ${role.trim()}`;

    try {
      const session = await analyzeAndSave({
        transcript,
        title,
        topic: role.trim(),
        mode: "interview",
        language,
        durationSeconds: Math.max(totalDuration, 1),
        targetDurationMinutes: TOTAL_QUESTIONS * PER_TURN_TARGET_MINUTES,
        // This legacy flow (kept for old deep links only — "Entretien" was
        // removed from the main UI) never offers the voice/video picker.
        analysisMode: "voice",
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
      await finishInterview(nextTurns);
      return;
    }

    setLoadingNextQuestion(true);
    const question = await requestNextQuestion(nextTurns);
    setCurrentQuestion(question);
    setQuestionNumber((n) => n + 1);
    setRecorderKey((k) => k + 1);
    setLoadingNextQuestion(false);
  }

  return (
    <div className="relative mx-auto max-w-2xl">
      {step === "setup" && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-[420px] bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_70%)]"
        />
      )}
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
              <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-xs font-medium text-muted">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                {d.interviewMode.interviewerBadge}
              </span>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                {d.interviewMode.setupTitle}
              </h1>
              <p className="mt-2 text-[15px] text-muted">{d.interviewMode.setupSubtitle}</p>
            </div>

            <div className="space-y-3 rounded-2xl border border-border bg-surface p-4">
              <Input
                name="role"
                icon={<User className="h-4 w-4" />}
                placeholder={d.interviewMode.rolePlaceholder}
                value={role}
                onChange={(event) => {
                  setRole(event.target.value);
                  if (event.target.value.trim()) setRoleError(false);
                }}
                error={roleError ? d.practice.titleRequired : undefined}
                maxLength={120}
              />
              <Input
                name="company"
                icon={<Building2 className="h-4 w-4" />}
                placeholder={d.interviewMode.companyPlaceholder}
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                maxLength={120}
              />
            </div>

            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-wide text-muted">
                {d.practice.languageLabel}
              </span>
              <LanguageSelector variant="premium" value={language} onChange={setLanguage} />
            </div>

            <Button
              size="lg"
              className="h-14 w-full rounded-2xl bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-base shadow-[0_20px_45px_-16px_var(--accent)] transition-transform hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-14px_var(--accent)]"
              onClick={handleStart}
            >
              {d.interviewMode.startInterview}
            </Button>
            {quotaExceeded && <QuotaExceededNotice />}
            {error && (
              <p className="rounded-xl bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
            )}
            <p className="text-center text-xs leading-relaxed text-muted">
              {d.interviewMode.disclaimer}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="interview"
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
                disabled={analyzing || loadingNextQuestion}
                className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground disabled:opacity-50"
              >
                <ArrowLeft className="h-4 w-4" />
                {d.practice.backToSetup}
              </button>
              <span className="text-xs font-medium tabular-nums text-muted">
                {d.interviewMode.questionProgress
                  .replace("{current}", String(questionNumber))
                  .replace("{total}", String(TOTAL_QUESTIONS))}
              </span>
            </div>

            <div className="rounded-3xl border border-accent/30 bg-accent-soft p-5">
              <div className="flex items-center gap-2 text-accent">
                <Briefcase className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  {d.interviewMode.interviewerAsks}
                </span>
              </div>
              {loadingNextQuestion ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-muted">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {d.interviewMode.interviewerThinking}
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
                onClick={() => finishInterview(turns)}
                disabled={analyzing}
                className="w-full cursor-pointer text-center text-sm text-muted underline-offset-4 transition-colors hover:text-foreground hover:underline disabled:opacity-50"
              >
                {d.interviewMode.finishNow}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {analyzing && <AnalyzingOverlay />}
    </div>
  );
}
