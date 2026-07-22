"use client";

import {
  CheckCircle2,
  Dumbbell,
  Lightbulb,
  XCircle,
} from "lucide-react";
import type { AnalysisResult } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { useDict } from "@/lib/i18n";

/** Strengths, weaknesses, tips and next exercises from the AI report. */
export function Insights({ analysis }: { analysis: AnalysisResult }) {
  const d = useDict();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardTitle>{d.results.strengths}</CardTitle>
        <ul className="mt-4 space-y-3">
          {analysis.strengths.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>{d.results.areasToImprove}</CardTitle>
        <ul className="mt-4 space-y-3">
          {analysis.weaknesses.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>{d.results.personalizedTips}</CardTitle>
        <ul className="mt-4 space-y-3">
          {analysis.tips.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <CardTitle>{d.results.nextExercises}</CardTitle>
        <ul className="mt-4 space-y-3">
          {analysis.nextExercises.map((item) => (
            <li key={item} className="flex items-start gap-2.5 text-sm">
              <Dumbbell className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
