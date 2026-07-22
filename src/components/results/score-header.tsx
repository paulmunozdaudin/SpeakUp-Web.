"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, Mic, Sparkles } from "lucide-react";
import type { AnalysisResult, PracticeMode } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScoreRing } from "@/components/ui/score-ring";
import { useDict } from "@/lib/i18n";
import { formatDate, formatDuration } from "@/utils/format";
import { scoreLabelKey } from "@/utils/score";
import { cn } from "@/utils/cn";

const PACE_TONE: Record<AnalysisResult["paceVerdict"], "warning" | "success"> = {
  slow: "warning",
  ideal: "success",
  fast: "warning",
};

export function ScoreHeader({
  title,
  mode,
  createdAt,
  durationSeconds,
  analysis,
}: {
  title: string;
  mode: PracticeMode;
  createdAt: string;
  durationSeconds: number;
  analysis: AnalysisResult;
}) {
  const d = useDict();
  const paceLabel =
    analysis.paceVerdict === "slow"
      ? d.results.paceSlow
      : analysis.paceVerdict === "fast"
        ? d.results.paceFast
        : d.results.paceIdeal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "relative overflow-hidden rounded-3xl border border-border bg-surface p-6 sm:p-8",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,var(--accent-soft),transparent_55%)] opacity-70"
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:gap-8">
        <ScoreRing score={analysis.overallScore} size={140} label={d.results.overall} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="accent">{d.modes[mode]}</Badge>
            <Badge tone={PACE_TONE[analysis.paceVerdict]}>
              <Gauge className="h-3 w-3" />
              {analysis.wordsPerMinute} {d.results.wordsPerMin} · {paceLabel}
            </Badge>
            <span className="text-xs text-muted">
              {formatDate(createdAt)} · {formatDuration(durationSeconds)}
            </span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            {title}
          </h1>
          <p className="mt-1 text-sm font-medium text-accent">
            {d.scoreLabels[scoreLabelKey(analysis.overallScore)]}
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            {analysis.summary}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link href="/practice">
              <Button>
                <Mic className="h-4 w-4" />
                {d.results.practiceAgain}
              </Button>
            </Link>
            <span className="inline-flex items-center gap-1.5 text-xs text-muted">
              <Sparkles className="h-3.5 w-3.5" />
              {analysis.provider === "openai"
                ? d.results.poweredByAi
                : d.results.poweredByHeuristic}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
