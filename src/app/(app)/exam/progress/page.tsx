"use client";

import Link from "next/link";
import { Award, BookMarked, BookOpen, GraduationCap } from "lucide-react";
import type { PracticeMode } from "@/types";
import { useSessions } from "@/hooks/use-sessions";
import { Card, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ExamEvolutionChart } from "@/components/exam/evolution-chart";
import { computeExamProgress, type ReadinessTier } from "@/services/exam-progress";
import { useDict } from "@/lib/i18n";

const EXAM_MODES = ["brevet-oral", "bac-francais-oral", "grand-oral"] as const;
type ExamMode = (typeof EXAM_MODES)[number];

const EXAM_ICONS: Record<ExamMode, typeof BookOpen> = {
  "brevet-oral": BookOpen,
  "bac-francais-oral": BookMarked,
  "grand-oral": Award,
};

const TIER_TONE: Record<ReadinessTier, "danger" | "warning" | "success"> = {
  notReady: "danger",
  gettingThere: "warning",
  ready: "success",
  veryReady: "success",
};

function isExamMode(mode: PracticeMode): mode is ExamMode {
  return (EXAM_MODES as readonly string[]).includes(mode);
}

export default function ExamProgressPage() {
  const d = useDict();
  const { sessions, loading } = useSessions();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const groups = EXAM_MODES.map((mode) => ({
    mode,
    // useSessions() already returns newest-first.
    sessions: sessions.filter((s) => isExamMode(s.mode) && s.mode === mode),
  })).filter((g) => g.sessions.length > 0);

  if (groups.length === 0) {
    return (
      <EmptyState
        icon={GraduationCap}
        title={d.examMode.emptyProgressTitle}
        description={d.examMode.emptyProgressDescription}
        action={
          <Link href="/exam">
            <Button>{d.examMode.newSimulation}</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          {d.examMode.progressPageTitle}
        </h1>
        <p className="mt-1 text-sm text-muted">{d.examMode.progressPageSubtitle}</p>
      </div>

      {groups.map(({ mode, sessions: modeSessions }) => {
        const progress = computeExamProgress(modeSessions);
        const Icon = EXAM_ICONS[mode];

        return (
          <section key={mode} className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Icon className="h-5 w-5 text-accent" />
                <h2 className="text-lg font-semibold">{d.modes[mode]}</h2>
                <Badge tone="neutral">
                  {d.examMode.simulationsCount.replace("{count}", String(modeSessions.length))}
                </Badge>
              </div>
              <Link
                href={`/exam?mode=${mode}&lang=fr`}
                className="text-sm font-medium text-accent hover:underline"
              >
                {d.examMode.newSimulation}
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <Card>
                <CardTitle>{d.examMode.readinessTitle}</CardTitle>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-3xl font-semibold tabular-nums tracking-tight">
                    {(progress.readinessScore / 5).toFixed(1)}
                    <span className="text-lg text-muted">{d.examMode.outOf20}</span>
                  </span>
                  <Badge tone={TIER_TONE[progress.readinessTier]}>
                    {d.examMode.readinessTiers[progress.readinessTier]}
                  </Badge>
                </div>

                {progress.priorityMetrics.length > 0 ? (
                  <div className="mt-5 space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wide text-muted">
                      {d.examMode.priorityTitle}
                    </p>
                    {progress.priorityMetrics.map((key) => (
                      <div key={key} className="rounded-xl bg-surface-muted p-3">
                        <p className="text-sm font-medium">{d.metrics[key]}</p>
                        <p className="mt-1 text-xs leading-relaxed text-muted">
                          {d.examMode.exercises[key]}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-success">{d.examMode.noRecurringErrors}</p>
                )}
              </Card>

              <Card>
                <CardTitle>{d.examMode.progressPageTitle}</CardTitle>
                <div className="mt-4">
                  <ExamEvolutionChart sessions={[...modeSessions].reverse()} />
                </div>
              </Card>
            </div>

            <Card>
              <CardTitle>{d.examMode.recurringErrorsTitle}</CardTitle>
              <p className="mt-1 text-sm text-muted">{d.examMode.recurringErrorsSubtitle}</p>

              {progress.recurringWeakMetrics.length > 0 || progress.recurringFillers.length > 0 ? (
                <div className="mt-4 space-y-4">
                  {progress.recurringWeakMetrics.length > 0 && (
                    <div className="space-y-2">
                      {progress.recurringWeakMetrics.map((key) => (
                        <div key={key} className="rounded-xl border border-border p-3">
                          <p className="text-sm font-medium">{d.metrics[key]}</p>
                          <p className="mt-1 text-xs leading-relaxed text-muted">
                            {d.examMode.exercises[key]}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {progress.recurringFillers.length > 0 && (
                    <div>
                      <p className="text-xs font-medium uppercase tracking-wide text-muted">
                        {d.examMode.recurringFillersTitle}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {progress.recurringFillers.map((filler) => (
                          <Badge key={filler.word} tone="warning">
                            &ldquo;{filler.word}&rdquo; × {filler.count}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="mt-4 text-sm text-success">{d.examMode.noRecurringErrors}</p>
              )}
            </Card>
          </section>
        );
      })}
    </div>
  );
}
