"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Download,
  FileQuestion,
  Gauge,
  LayoutList,
  Megaphone,
  Mic,
  MicVocal,
  ShieldCheck,
} from "lucide-react";
import type { PracticeSession } from "@/types";
import { getSession } from "@/services/sessions.service";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScoreRing } from "@/components/ui/score-ring";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { MetricCard } from "@/components/results/metric-card";
import { FillerWordsCard } from "@/components/results/filler-words-card";
import { Insights } from "@/components/results/insights";
import { useDict } from "@/lib/i18n";
import { formatDate, formatDuration } from "@/utils/format";
import { scoreLabelKey } from "@/utils/score";

export default function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const d = useDict();
  const { id } = use(params);
  const [session, setSession] = useState<PracticeSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSession(id)
      .then(setSession)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-44" />
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

  return (
    <div className="space-y-8">
      {/* Header: overall score + session meta + actions */}
      <Card className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8 sm:p-8">
        <ScoreRing
          score={analysis.overallScore}
          size={140}
          label={d.results.overall}
        />
        <div className="flex-1 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Badge tone="accent">{d.modes[session.mode]}</Badge>
            <span className="text-xs text-muted">
              {formatDate(session.createdAt)} ·{" "}
              {formatDuration(session.durationSeconds)}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            {session.topic}
          </h1>
          <p className="mt-1 text-sm font-medium text-muted">
            {d.scoreLabels[scoreLabelKey(analysis.overallScore)]} —{" "}
            {analysis.summary}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3 sm:justify-start">
            <Link href="/practice">
              <Button>
                <Mic className="h-4 w-4" />
                {d.results.practiceAgain}
              </Button>
            </Link>
            {/* TODO(reports): generate a shareable PDF report. */}
            <Button
              variant="secondary"
              onClick={() => alert(d.results.reportsSoon)}
            >
              <Download className="h-4 w-4" />
              {d.results.downloadReport}
            </Button>
          </div>
        </div>
      </Card>

      {/* Metric grid */}
      <section>
        <h2 className="mb-4 text-sm font-medium text-muted">
          {d.results.detailedBreakdown}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <MetricCard
            icon={MicVocal}
            label={d.results.clarity}
            score={analysis.clarity.score}
            feedback={analysis.clarity.feedback}
            delay={0}
          />
          <MetricCard
            icon={ShieldCheck}
            label={d.results.confidence}
            score={analysis.confidence.score}
            feedback={analysis.confidence.feedback}
            delay={0.06}
          />
          <MetricCard
            icon={Gauge}
            label={d.results.pace}
            score={analysis.pace.score}
            feedback={analysis.pace.feedback}
            detail={`${analysis.pace.wordsPerMinute} ${d.results.wordsPerMin}`}
            delay={0.12}
          />
          <MetricCard
            icon={LayoutList}
            label={d.results.structure}
            score={analysis.structure.score}
            feedback={analysis.structure.feedback}
            delay={0.18}
          />
          <MetricCard
            icon={Megaphone}
            label={d.results.persuasiveness}
            score={analysis.persuasiveness.score}
            feedback={analysis.persuasiveness.feedback}
            delay={0.24}
          />
          <MetricCard
            icon={BookOpen}
            label={d.results.vocabulary}
            score={analysis.vocabulary.score}
            feedback={analysis.vocabulary.feedback}
            delay={0.3}
          />
        </div>
      </section>

      <FillerWordsCard fillerWords={analysis.fillerWords} />

      {/* Insights */}
      <section>
        <h2 className="mb-4 text-sm font-medium text-muted">
          {d.results.coachInsights}
        </h2>
        <Insights analysis={analysis} />
      </section>
    </div>
  );
}
