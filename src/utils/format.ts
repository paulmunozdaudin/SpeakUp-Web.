/** Shared formatting helpers, aware of the active UI language. */

import { getLocale } from "@/lib/i18n";

const localeTag = () => (getLocale() === "es" ? "es-ES" : "en-US");

/** 125 -> "2:05" */
export function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/** ISO date -> "Jul 21, 2026" / "21 jul 2026" */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(localeTag(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
