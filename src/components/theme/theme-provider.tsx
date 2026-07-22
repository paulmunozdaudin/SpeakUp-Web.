"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "orato-theme";
const MEDIA_QUERY = "(prefers-color-scheme: dark)";

/* System dark-mode preference as an external store (SSR-safe). */
function subscribeToSystemTheme(callback: () => void) {
  const media = window.matchMedia(MEDIA_QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

const getSystemDark = () => window.matchMedia(MEDIA_QUERY).matches;
const getServerSystemDark = () => false;

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(STORAGE_KEY) as Theme | null) ?? "system";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readStoredTheme);
  const systemDark = useSyncExternalStore(
    subscribeToSystemTheme,
    getSystemDark,
    getServerSystemDark,
  );

  const resolvedTheme: "light" | "dark" =
    theme === "dark" || (theme === "system" && systemDark) ? "dark" : "light";

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
    var dark = t === "dark" || ((t === null || t === "system") &&
      window.matchMedia("${MEDIA_QUERY}").matches);
    if (dark) document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;
