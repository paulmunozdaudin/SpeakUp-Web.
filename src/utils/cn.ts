import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * className combiner. Uses tailwind-merge so a later conflicting utility
 * (e.g. an override passed via `className`) always wins over an earlier
 * one from the same component — plain string concatenation left the
 * winner up to Tailwind's internal CSS generation order instead, which
 * silently broke overrides like `className="bg-white text-accent"` on a
 * <Button> whose default variant already sets `bg-accent text-white`.
 */
export function cn(...classes: ClassValue[]): string {
  return twMerge(clsx(classes));
}
