"use client";

import { Globe } from "lucide-react";
import { useLocale, type Locale } from "@/lib/i18n";

/** Cycle order for the single-button switch: EN -> ES -> FR -> EN. */
const NEXT: Record<Locale, Locale> = { en: "es", es: "fr", fr: "en" };

const NEXT_LABEL: Record<Locale, string> = {
  en: "Ver en español",
  es: "Voir en français",
  fr: "View in English",
};

/** EN/ES/FR switch shown in the navbar and the app sidebar. */
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      type="button"
      aria-label={NEXT_LABEL[locale]}
      onClick={() => setLocale(NEXT[locale])}
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase">{locale}</span>
    </button>
  );
}
