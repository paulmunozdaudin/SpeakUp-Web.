"use client";

import { TARGET_DURATIONS, type TargetDuration } from "@/types";
import { useDict } from "@/lib/i18n";
import { cn } from "@/utils/cn";

export function DurationSelector({
  value,
  onChange,
}: {
  value: TargetDuration;
  onChange: (minutes: TargetDuration) => void;
}) {
  const d = useDict();

  return (
    <div className="grid grid-cols-4 gap-2">
      {TARGET_DURATIONS.map((minutes) => {
        const active = value === minutes;
        return (
          <button
            key={minutes}
            type="button"
            onClick={() => onChange(minutes)}
            aria-pressed={active}
            className={cn(
              "flex h-14 flex-col items-center justify-center rounded-xl border text-sm font-medium transition-all duration-200",
              active
                ? "border-accent bg-accent-soft text-accent shadow-sm shadow-accent/10"
                : "border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground",
            )}
          >
            <span className="text-lg font-semibold tabular-nums leading-none">
              {minutes}
            </span>
            <span className="mt-0.5 text-[11px]">{d.practice.durationMinutes}</span>
          </button>
        );
      })}
    </div>
  );
}
