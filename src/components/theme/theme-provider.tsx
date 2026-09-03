"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

/** "system" may still linger in a returning visitor's localStorage from
 *  before dark became the default regardless of OS preference — accepted
 *  on read and resolved to dark, but never written again. */
type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "eloq-theme";

function readStoredTheme(): Theme {
  // Dark by default on a visitor's first-ever visit — the toggle lets them
  // switch to light, and that explicit choice is what gets stored and
  // respected on every later visit.
  if (typeof window === "undefined") return "dark";
  return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "dark";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);

  // Dark unless the visitor explicitly chose light — covers a fresh visit
  // (no stored value) and a legacy "system" value the same way.
  const resolvedTheme: "light" | "dark" = theme === "light" ? "light" : "dark";

  // Keep the <html> class in sync (the init script handles first paint).
  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

/**
 * Inline script injected in <head> to set the theme class before hydration,
 * preventing a flash of the wrong theme.
 */
export const themeInitScript = `
(function () {
  try {
    var t = localStorage.getItem("${STORAGE_KEY}");
    if (t !== "light") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;
