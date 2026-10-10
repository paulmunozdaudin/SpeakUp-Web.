"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, FileQuestion, RotateCcw, Zap } from "lucide-react";
import type { PracticeSession } from "@/types";
import { getSession } from "@/services/sessions.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreHeader } from "@/components/results/score-header";
import { ExamGradeCard } from "@/components/results/exam-grade-card";
import { BacFrancaisResultCard } from "@/components/results/bac-francais-result-card";
import { MetricsGrid } from "@/components/results/metrics-grid";
import { FillerWordsCard } from "@/components/results/filler-words-card";
import { PauseCard } from "@/components/results/pause-card";
import { StructureCard } from "@/components/results/structure-card";
import { Insights, QuestionsCard } from "@/components/results/insights";
import { FactCheckCard } from "@/components/results/fact-check-card";
import { VideoPresenceGrid } from "@/components/results/video-presence-grid";
import { TranscriptCard } from "@/components/results/transcript-card";
import { ImprovedVersionCard } from "@/components/results/improved-version-card";
import { ResultsTabs } from "@/components/results/results-tabs";
import { ChallengeResult } from "@/components/results/challenge-result";
import { useDict } from "@/lib/i18n";
import { fr } from "@/lib/i18n/translations";
import { fill, sessionXp } from "@/lib/challenges";

type TabKey = "overview" | "metrics" | "transcript" | "improved" | "questions";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const d = useDict();
  const { id } = use(params);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("overview");

  useEffect(() => {
    getSession(id)
      .then(setSession)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48" />
        <Skeleton className="h-10 w-80" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <EmptyState
        icon={FileQuestion}
        title={d.results.notFoundTitle}
        description={d.results.notFoundDescription}
        action={
          <Link href="/dashboard">
            <Button variant="secondary">{d.results.backToDashboard}</Button>
          </Link>
        }
      />
    );
  }

  const { analysis } = session;
  const isExamMode =
    session.mode === "brevet-oral" ||
    session.mode === "bac-francais-oral" ||
    session.mode === "grand-oral";

  // Challenges are judged on their own rubric — no "improved version" of a
  // reading or audience questions for a 1-minute story.
  const challengeEval = session.mode === "challenge" ? analysis.challengeEval : undefined;
  const tabs: { key: TabKey; label: string }[] = challengeEval
    ? [
        { key: "overview", label: d.challenges.result.tabResult },
        { key: "transcript", label: d.results.tabTranscript },
      ]
    : [
        { key: "overview", label: d.results.tabOverview },
        { key: "metrics", label: d.results.tabMetrics },
        { key: "transcript", label: d.results.tabTranscript },
        { key: "improved", label: d.results.tabImproved },
        { key: "questions", label: d.results.tabQuestions },
      ];

  return (
    <div className="space-y-6">
      <ScoreHeader
        title={session.topic}
        mode={session.mode}
        createdAt={session.createdAt}
        durationSeconds={session.durationSeconds}
        analysis={analysis}
      />

      {session.mode === "challenge" && (
        <Link
          href="/challenges"
          className="group flex items-center gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-5 py-4 transition-colors hover:border-accent"
        >
          <Zap className="h-5 w-5 shrink-0 text-accent" />
          <span className="flex-1 text-sm">
            <span className="font-semibold text-accent">
              {fill(d.challenges.xpEarned, { xp: sessionXp(session) })}
            </span>
            {session.analysis.challenge?.daily && (
              <span className="text-muted"> · {d.challenges.dailyTitle}</span>
            )}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
            {d.challenges.seeProgress}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      )}

      {isExamMode && (
        <>
          <ExamGradeCard
            overallScore={analysis.overallScore}
            durationSeconds={session.durationSeconds}
            grade20={analysis.bacFrancais?.grade20}
          />
          <Link
            href={`/exam?mode=${session.mode}&repeat=${session.id}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {fr.examMode.redoExam}
          </Link>
        </>
      )}

      <ResultsTabs
        tabs={tabs}
        active={tab}
        onChange={(key) => setTab(key as TabKey)}
      />

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          {tab === "overview" && challengeEval && (
            <ChallengeResult evaluation={challengeEval} />
          )}

          {tab === "overview" && !challengeEval && (
            <div className="space-y-4">
              {analysis.bacFrancais && (
                <BacFrancaisResultCard evaluation={analysis.bacFrancais} />
              )}
              <div className="grid gap-4 lg:grid-cols-2">
                <StructureCard structure={analysis.structure} />
                <FillerWordsCard fillerWords={analysis.fillerWords} />
                {analysis.pauses && <PauseCard pauses={analysis.pauses} />}
              </div>
              <FactCheckCard claims={analysis.factCheck} />
              {analysis.video && (
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-muted">
                    {d.results.presenceTitle}
                  </h2>
                  <VideoPresenceGrid video={analysis.video} />
                </div>
              )}
              <Insights analysis={analysis} />
            </div>
          )}

          {tab === "metrics" && <MetricsGrid metrics={analysis.metrics} />}

          {tab === "transcript" && (
            <TranscriptCard transcript={analysis.transcript} />
          )}

          {tab === "improved" && (
            <ImprovedVersionCard improvedVersion={analysis.improvedVersion} />
          )}

          {tab === "questions" && (
            <QuestionsCard
              analysis={analysis}
              questionsLabel={d.results.questionsSubtitle[session.mode]}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
