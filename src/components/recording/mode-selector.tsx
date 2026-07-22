"use client";

import {
  Briefcase,
  GraduationCap,
  Landmark,
  Languages,
  Mic2,
  Presentation,
  Rocket,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { PracticeMode } from "@/types";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

const MODE_ICONS: Record<PracticeMode, LucideIcon> = {
  presentation: Presentation,
  interview: Briefcase,
  "startup-pitch": Rocket,
  school: GraduationCap,
  "ted-talk": Landmark,
  "sales-pitch": Mic2,
  "language-exam": Languages,
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
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
      {(Object.keys(MODE_ICONS) as PracticeMode[]).map((mode) => {
        const Icon = MODE_ICONS[mode];
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "flex cursor-pointer flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
              active
                ? "border-accent bg-accent-soft text-accent shadow-sm"
                : "border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground",
            )}
            aria-pressed={active}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium leading-tight">
              {d.modes[mode]}
            </span>
          </button>
        );
      })}
    </div>
  );
}
