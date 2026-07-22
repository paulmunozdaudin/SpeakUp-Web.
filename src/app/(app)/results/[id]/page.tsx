"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { FileQuestion } from "lucide-react";
import type { PracticeSession } from "@/types";
import { getSession } from "@/services/sessions.service";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ScoreHeader } from "@/components/results/score-header";
import { MetricsGrid } from "@/components/results/metrics-grid";
import { FillerWordsCard } from "@/components/results/filler-words-card";
import { StructureCard } from "@/components/results/structure-card";
import { Insights, QuestionsCard } from "@/components/results/insights";
import { TranscriptCard } from "@/components/results/transcript-card";
import { ImprovedVersionCard } from "@/components/results/improved-version-card";
import { ResultsTabs } from "@/components/results/results-tabs";
import { useDict } from "@/lib/i18n";

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

  const tabs: { key: TabKey; label: string }[] = [
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
          {tab === "overview" && (
            <div className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-2">
                <StructureCard structure={analysis.structure} />
                <FillerWordsCard fillerWords={analysis.fillerWords} />
              </div>
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
