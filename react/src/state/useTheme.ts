import { useEffect, useState } from "react";

export type Theme = "light" | "dark";

const STORAGE_KEY = "harplayout-theme";

function getInitial(): Theme {
  // The inline script in index.html sets this before paint; trust it first.
  if (typeof document !== "undefined") {
    const d = document.documentElement.dataset.theme;
    if (d === "light" || d === "dark") return d;
  }
  if (typeof window === "undefined") return "dark"; // SSR / tests
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia?.("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  } catch {
    return "dark";
  }
}

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(getInitial);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* ignore storage failures (private mode etc.) */
    }
  }, [theme]);

  const toggle = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggle };
}
