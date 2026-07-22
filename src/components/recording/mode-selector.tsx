"use client";

import { Briefcase, GraduationCap, Presentation, Rocket, ScrollText } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PracticeMode } from "@/types";
import { PRACTICE_MODES } from "@/types";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

const MODE_ICONS: Record<PracticeMode, LucideIcon> = {
  presentation: Presentation,
  "startup-pitch": Rocket,
  interview: Briefcase,
  "oral-exam": GraduationCap,
  "project-defense": ScrollText,
};

export function ModeSelector({
  value,
  onChange,
}: {
  value: PracticeMode;
  onChange: (mode: PracticeMode) => void;
}) {
  const d = useDict();

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PRACTICE_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode];
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "group flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200",
              active
                ? "border-accent bg-accent-soft shadow-sm shadow-accent/10"
                : "border-border bg-surface hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm",
            )}
            aria-pressed={active}
          >
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors",
                active
                  ? "bg-accent text-white"
                  : "bg-surface-muted text-muted group-hover:text-foreground",
              )}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block text-sm font-semibold leading-tight",
                  active && "text-accent",
                )}
              >
                {d.modes[mode]}
              </span>
              <span className="mt-0.5 block text-xs text-muted">
                {d.modeDescriptions[mode]}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
