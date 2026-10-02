"use client";

import {
  Award,
  BookMarked,
  BookOpen,
  Briefcase,
  GraduationCap,
  Presentation,
  Rocket,
  ScrollText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PracticeMode } from "@/types";
import { PRACTICE_PICKER_MODES } from "@/types";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

/** Kept as a full Record (incl. the French exam modes) purely so indexing
 *  stays type-safe — only PRACTICE_PICKER_MODES is actually rendered here.
 *  The exam modes' icons are used by /exam instead. */
const MODE_ICONS: Record<PracticeMode, LucideIcon> = {
  presentation: Presentation,
  "startup-pitch": Rocket,
  interview: Briefcase,
  "oral-exam": GraduationCap,
  "project-defense": ScrollText,
  "brevet-oral": BookOpen,
  "bac-francais-oral": BookMarked,
  "grand-oral": Award,
};

export function ModeSelector({
  value,
  onChange,
  variant = "default",
}: {
  value: PracticeMode;
  onChange: (mode: PracticeMode) => void;
  /** "premium" is the bigger, glowier card treatment used on /practice. */
  variant?: "default" | "premium";
}) {
  const d = useDict();
  const premium = variant === "premium";

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {PRACTICE_PICKER_MODES.map((mode) => {
        const Icon = MODE_ICONS[mode];
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "group relative flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200",
              premium && "flex-col gap-0 p-5",
              active
                ? premium
                  ? "border-accent bg-[linear-gradient(165deg,color-mix(in_srgb,var(--accent)_16%,transparent),transparent_60%)] shadow-[0_18px_45px_-18px_var(--accent)]"
                  : "border-accent bg-accent-soft shadow-sm shadow-accent/10"
                : "border-border bg-surface hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-sm",
            )}
            aria-pressed={active}
          >
            {premium && active && (
              <span className="absolute right-4 top-4 flex h-5.5 w-5.5 items-center justify-center rounded-full bg-accent text-[11px] font-bold text-white">
                ✓
              </span>
            )}
            <span
              className={cn(
                "flex shrink-0 items-center justify-center rounded-xl transition-colors",
                premium ? "mb-3.5 h-11 w-11 rounded-2xl" : "h-10 w-10",
                active
                  ? premium
                    ? "bg-[linear-gradient(135deg,var(--accent-hover),var(--accent))] text-white shadow-[0_8px_20px_-6px_var(--accent)]"
                    : "bg-accent text-white"
                  : "bg-surface-muted text-muted group-hover:text-foreground",
              )}
            >
              <Icon className={premium ? "h-5.5 w-5.5" : "h-5 w-5"} />
            </span>
            <span className="min-w-0">
              <span
                className={cn(
                  "block font-semibold leading-tight",
                  premium ? "text-[15px]" : "text-sm",
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
