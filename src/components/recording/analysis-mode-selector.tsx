"use client";

import { Mic, Video } from "lucide-react";
import type { AnalysisMode } from "@/types";
import { useDict } from "@/lib/i18n";
import type { Dictionary } from "@/lib/i18n/translations";
import { cn } from "@/utils/cn";

/**
 * The "¿Cómo quieres practicar?" screen — exactly two options, understood
 * at a glance: mic only, or mic + camera. Deliberately simple (no nested
 * settings) per the product brief — this is the one decision that changes
 * which analysis pipeline runs, so it has to be unambiguous before
 * recording starts.
 */
export function AnalysisModeSelector({
  value,
  onChange,
  dict,
}: {
  value: AnalysisMode;
  onChange: (mode: AnalysisMode) => void;
  /** Override the visitor's own locale — /exam forces French throughout
   *  (the real French exams are always sat in French), so it passes its
   *  hardcoded `fr` dictionary here instead of letting this component read
   *  whatever locale the visitor's browser happens to be set to. */
  dict?: Dictionary;
}) {
  const autoDict = useDict();
  const d = dict ?? autoDict;

  const options: {
    mode: AnalysisMode;
    icon: typeof Mic;
    title: string;
    description: string;
    note?: string;
  }[] = [
    {
      mode: "voice",
      icon: Mic,
      title: d.practice.analysisModeVoiceTitle,
      description: d.practice.analysisModeVoiceDescription,
    },
    {
      mode: "video",
      icon: Video,
      title: d.practice.analysisModeVideoTitle,
      description: d.practice.analysisModeVideoDescription,
      note: d.practice.analysisModeVideoNote,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map(({ mode, icon: Icon, title, description, note }) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "group flex cursor-pointer flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all duration-200",
              active
                ? "border-accent bg-accent-soft shadow-sm shadow-accent/10"
                : "border-border bg-surface hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm",
            )}
            aria-pressed={active}
          >
            <span
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors",
                active
                  ? "bg-accent text-white"
                  : "bg-surface-muted text-muted group-hover:text-foreground",
              )}
            >
              <Icon className="h-5.5 w-5.5" />
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block text-sm font-semibold leading-tight",
                  active && "text-accent",
                )}
              >
                {title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {description}
              </span>
              {note && (
                <span className="mt-2 block text-xs leading-relaxed text-muted/70">
                  {note}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
