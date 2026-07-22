"use client";

import { CheckCircle2, ListChecks, XCircle } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { useDict } from "@/lib/i18n";

/** Strengths, weaknesses and the 5 concrete recommendations. */
export function Insights({ analysis }: { analysis: AnalysisResult }) {
  const d = useDict();

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardTitle>{d.results.highlightsTitle}</CardTitle>
          <ul className="mt-4 space-y-3">
            {analysis.highlights.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {item}
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardTitle>{d.results.weaknessesTitle}</CardTitle>
          <ul className="mt-4 space-y-3">
            {analysis.weaknesses.map((item, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card>
        <CardTitle>{d.results.recommendationsTitle}</CardTitle>
        <ol className="mt-4 space-y-3">
          {analysis.recommendations.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent">
                {i + 1}
              </span>
              {item}
            </li>
          ))}
        </ol>
      </Card>
    </div>
  );
}

export function QuestionsCard({ analysis, questionsLabel }: { analysis: AnalysisResult; questionsLabel: string }) {
  return (
    <Card>
      <div className="flex items-center gap-2">
        <ListChecks className="h-4 w-4 text-accent" />
        <CardTitle>{questionsLabel}</CardTitle>
      </div>
      <ol className="mt-4 space-y-3">
        {analysis.audienceQuestions.map((question, i) => (
          <li key={i} className="flex items-start gap-3 text-sm leading-relaxed">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-muted">
              {i + 1}
            </span>
            {question}
          </li>
        ))}
      </ol>
    </Card>
  );
}
