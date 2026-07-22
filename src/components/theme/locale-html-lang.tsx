"use client";

import { useEffect } from "react";
import { useLocale } from "@/lib/i18n";

/** Keeps <html lang> in sync with the active locale (a11y + SEO). */
export function LocaleHtmlLang() {
  const { locale } = useLocale();

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
