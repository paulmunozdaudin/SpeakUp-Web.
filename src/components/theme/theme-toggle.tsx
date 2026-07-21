"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";

/** Small icon button that flips between light and dark. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-muted hover:text-foreground"
    >
      <Sun className="h-4.5 w-4.5 dark:hidden" />
      <Moon className="hidden h-4.5 w-4.5 dark:block" />
    </button>
  );
}
