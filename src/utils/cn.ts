/** Minimal className combiner (avoids an extra dependency for the MVP). */
export function cn(
  ...classes: (string | false | null | undefined)[]
): string {
  return classes.filter(Boolean).join(" ");
}
