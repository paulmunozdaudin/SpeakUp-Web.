"use client";

import {
  BadgeCheck,
  Ban,
  BookOpen,
  CheckCheck,
  Eye,
  Feather,
  FileText,
  Flag,
  Gauge,
  Lightbulb,
  ListOrdered,
  Magnet,
  MessageSquareOff,
  Puzzle,
  ShieldCheck,
  Sparkles,
  SpellCheck,
  Target,
  Timer,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ChallengeDimension, ChallengeEvaluation } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { MetricCard } from "./metric-card";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

const DIMENSION_ICONS: Record<ChallengeDimension, LucideIcon> = {
  onTopic: Target,
  structure: ListOrdered,
  fluency: Waves,
  vocabulary: SpellCheck,
  confidence: ShieldCheck,
  accuracy: CheckCheck,
  pace: Gauge,
  pauses: Timer,
  simplicity: Feather,
  analogy: Puzzle,
  correctness: BadgeCheck,
  clarity: Eye,
  fillers: MessageSquareOff,
  blanks: Timer,
  content: FileText,
  hook: Magnet,
  narrative: BookOpen,
  details: Sparkles,
  ending: Flag,
};

/** The challenge-specific report: the measured numbers that matter for
 *  this type of challenge, its own dimensions, and one tip for next time —
 *  instead of the generic presentation report. */
export function ChallengeResult({ evaluation }: { evaluation: ChallengeEvaluation }) {
  const d = useDict();
  const r = d.challenges.result;
  const { stats } = evaluation;

  const keyStats = [
    ...(evaluation.reading
      ? [{ value: `${evaluation.reading.accuracy}%`, label: r.statAccuracy, highlight: true }]
      : []),
    {
      value: String(stats.fillerTotal),
      label: r.statFillers,
      highlight: evaluation.type === "noFillers",
    },
    { value: String(stats.wordsPerMinute), label: r.statWpm, highlight: false },
    {
      value: stats.blanks === null ? "—" : String(stats.blanks),
      label: r.statBlanks,
      highlight: false,
    },
  ];

  return (
    <div className="space-y-4">
      <div className={cn("grid gap-3", keyStats.length === 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3")}>
        {keyStats.map((stat) => (
          <div
            key={stat.label}
            className={cn(
              "rounded-2xl border p-4",
              stat.highlight ? "border-accent/40 bg-accent-soft" : "border-border bg-surface",
            )}
          >
            <p
              className={cn(
                "text-2xl font-semibold tabular-nums tracking-tight",
                stat.highlight && "text-accent",
              )}
            >
              {stat.value}
            </p>
            <p className="text-xs text-muted">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-2xl border border-accent/40 bg-accent-soft px-5 py-4">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent">{r.nextTipTitle}</p>
          <p className="mt-1 text-sm leading-relaxed">{evaluation.nextTip}</p>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-muted">{r.dimensionsTitle}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {evaluation.dimensions.map((dim, index) => (
            <MetricCard
              key={dim.key}
              icon={DIMENSION_ICONS[dim.key] ?? Ban}
              label={d.challenges.dimensions[dim.key]}
              score={dim.score}
              feedback={dim.feedback}
              delay={index * 0.05}
            />
          ))}
        </div>
      </section>

      {(evaluation.strengths.length > 0 || evaluation.improvements.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {evaluation.strengths.length > 0 && (
            <Card>
              <CardTitle>{r.strengthsTitle}</CardTitle>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                {evaluation.strengths.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {evaluation.improvements.length > 0 && (
            <Card>
              <CardTitle>{r.improvementsTitle}</CardTitle>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed">
                {evaluation.improvements.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {evaluation.reading && (
        <Card>
          <CardTitle>{r.readingTitle}</CardTitle>
          <p className="mt-1 text-xs text-muted">{r.readingLegend}</p>
          <p className="mt-4 text-[15px] leading-relaxed">
            {evaluation.reading.words.map((word, index) => (
              <span key={index}>
                <span
                  className={cn(
                    !word.read && "rounded bg-danger/10 px-0.5 text-danger line-through",
                  )}
                >
                  {word.text}
                </span>{" "}
              </span>
            ))}
          </p>
        </Card>
      )}
    </div>
  );
}
