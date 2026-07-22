"use client";

import type { SpeechLanguage } from "@/types";
import { cn } from "@/utils/cn";

const OPTIONS: { value: SpeechLanguage; label: string; flag: string }[] = [
  { value: "es", label: "Español", flag: "🇪🇸" },
  { value: "en", label: "English", flag: "🇺🇸" },
];

export function LanguageSelector({
  value,
  onChange,
}: {
  value: SpeechLanguage;
  onChange: (language: SpeechLanguage) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {OPTIONS.map((option) => {
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            className={cn(
              "flex h-11 items-center justify-center gap-2 rounded-xl border text-sm font-medium transition-all duration-200",
              active
                ? "border-accent bg-accent-soft text-accent shadow-sm shadow-accent/10"
                : "border-border bg-surface text-muted hover:border-accent/40 hover:text-foreground",
            )}
          >
            <span aria-hidden>{option.flag}</span>
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
