"use client";

import { Check, X } from "lucide-react";
import type { AnalysisResult } from "@/types";
import { Card, CardTitle } from "@/components/ui/card";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

export function StructureCard({
  structure,
}: {
  structure: AnalysisResult["structure"];
}) {
  const d = useDict();

  const parts = [
    { label: d.results.structureIntro, present: structure.hasIntro },
    { label: d.results.structureBody, present: structure.hasBody },
    { label: d.results.structureConclusion, present: structure.hasConclusion },
  ];

  return (
    <Card>
      <CardTitle>{d.results.structureTitle}</CardTitle>
      <div className="mt-4 grid grid-cols-3 gap-2.5">
        {parts.map((part) => (
          <div
            key={part.label}
            className={cn(
              "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center",
              part.present
                ? "border-success/30 bg-success/10"
                : "border-danger/30 bg-danger/10",
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full",
                part.present ? "bg-success text-white" : "bg-danger text-white",
              )}
            >
              {part.present ? (
                <Check className="h-4 w-4" />
              ) : (
                <X className="h-4 w-4" />
              )}
            </span>
            <span className="text-xs font-medium">{part.label}</span>
            <span
              className={cn(
                "text-[11px]",
                part.present ? "text-success" : "text-danger",
              )}
            >
              {part.present ? d.results.present : d.results.missing}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm leading-relaxed text-muted">
        {structure.commentary}
      </p>
    </Card>
  );
}
