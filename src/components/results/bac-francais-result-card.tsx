"use client";

import {
  BookOpenCheck,
  Clock3,
  Compass,
  Feather,
  Gauge,
  Library,
  MessageCircleQuestion,
  MessageSquareOff,
  Mic2,
  Scale,
  SpellCheck,
  Waves,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { BacFrancaisDimension, BacFrancaisEvaluation } from "@/types";
import { BAC_FRANCAIS_DIMENSIONS } from "@/types";
import { MetricCard } from "./metric-card";
import { Card, CardTitle } from "@/components/ui/card";
import { fr as d } from "@/lib/i18n/translations";

const DIMENSION_ICONS: Record<BacFrancaisDimension, LucideIcon> = {
  explicationQuality: BookOpenCheck,
  literaryAnalysis: Feather,
  textMastery: Library,
  workMastery: Compass,
  answerRelevance: MessageCircleQuestion,
  argumentation: Scale,
  oralExpression: Mic2,
  fluency: Waves,
  vocabulary: SpellCheck,
  pace: Gauge,
  fillerWords: MessageSquareOff,
  timeManagement: Clock3,
};

/**
 * The Bac de Français-specific evaluation — 12 dimensions a real jury
 * actually scores (literary analysis, mastery of the text/work, relevance
 * of the entretien answers…), deliberately separate from the generic
 * 13-metric coaching grid used for every other practice mode, plus the
 * points forts / points à améliorer / priorities a real report would give.
 */
export function BacFrancaisResultCard({
  evaluation,
}: {
  evaluation: BacFrancaisEvaluation;
}) {
  const hasFeedback =
    evaluation.strengths.length > 0 ||
    evaluation.improvements.length > 0 ||
    evaluation.priorities.length > 0;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold tracking-tight">{d.examMode.bacDimensionsTitle}</h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {BAC_FRANCAIS_DIMENSIONS.map((key, index) => (
          <MetricCard
            key={key}
            icon={DIMENSION_ICONS[key]}
            label={d.examMode.bacDimensions[key]}
            score={evaluation.dimensions[key].score}
            feedback={evaluation.dimensions[key].feedback}
            delay={index * 0.04}
          />
        ))}
      </div>

      {hasFeedback && (
        <div className="grid gap-4 lg:grid-cols-3">
          {evaluation.strengths.length > 0 && (
            <Card>
              <CardTitle>{d.examMode.bacStrengthsTitle}</CardTitle>
              <ul className="mt-3 space-y-2 text-sm">
                {evaluation.strengths.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-success">•</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {evaluation.improvements.length > 0 && (
            <Card>
              <CardTitle>{d.examMode.bacImprovementsTitle}</CardTitle>
              <ul className="mt-3 space-y-2 text-sm">
                {evaluation.improvements.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-warning">•</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {evaluation.priorities.length > 0 && (
            <Card>
              <CardTitle>{d.examMode.bacPrioritiesTitle}</CardTitle>
              <ul className="mt-3 space-y-2 text-sm">
                {evaluation.priorities.map((item, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="font-medium text-accent">{i + 1}.</span>
                    <span className="text-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
