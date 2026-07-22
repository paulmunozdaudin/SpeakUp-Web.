"use client";

/**
 * Lightweight client-side i18n.
 * Locale lives in localStorage and is exposed through useSyncExternalStore,
 * so it is SSR-safe (server renders English, client re-renders with the
 * stored/browser locale right after hydration).
 */

import { useCallback, useSyncExternalStore } from "react";
import { en, es, type Dictionary } from "./translations";

export type Locale = "en" | "es";

export const DICTIONARIES: Record<Locale, Dictionary> = { en, es };

const STORAGE_KEY = "speakup-locale";
const CHANGE_EVENT = "speakup-locale-change";

/** Current locale, readable outside React (e.g. services). */
export function getLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "en" || stored === "es") return stored;
  // First visit: follow the browser language.
  return navigator.language.toLowerCase().startsWith("es") ? "es" : "en";
}

export function setLocale(locale: Locale) {
  localStorage.setItem(STORAGE_KEY, locale);
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CHANGE_EVENT, callback);
  return () => window.removeEventListener(CHANGE_EVENT, callback);
}

const getServerLocale = (): Locale => "en";

/** Reactive locale + setter. */
export function useLocale(): { locale: Locale; setLocale: (l: Locale) => void } {
  const locale = useSyncExternalStore(subscribe, getLocale, getServerLocale);
  const set = useCallback((l: Locale) => setLocale(l), []);
  return { locale, setLocale: set };
}

/** The full dictionary for the current locale. */
export function useDict(): Dictionary {
  const { locale } = useLocale();
  return DICTIONARIES[locale];
}
