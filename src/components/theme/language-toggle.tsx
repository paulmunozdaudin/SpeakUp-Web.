"use client";

import { Globe } from "lucide-react";
import { useLocale } from "@/lib/i18n";

/** EN/ES switch shown in the navbar and the app sidebar. */
export function LanguageToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <button
      type="button"
      aria-label={locale === "en" ? "Ver en español" : "View in English"}
      onClick={() => setLocale(locale === "en" ? "es" : "en")}
      className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase">{locale === "en" ? "ES" : "EN"}</span>
    </button>
  );
}
