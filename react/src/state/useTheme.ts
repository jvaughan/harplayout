import { useEffect, useState } from "react";

export type Theme = "light" | "dark" | "legacy";

const STORAGE_KEY = "harplayout-theme";

// The cycle order of the switcher button: dark → light → legacy → dark.
const CYCLE: Theme[] = ["dark", "light", "legacy"];

function isTheme(v: string | null | undefined): v is Theme {
  return v === "light" || v === "dark" || v === "legacy";
}

function getInitial(): Theme {
  // The inline script in index.html sets this before paint; trust it first.
  if (typeof document !== "undefined") {
    const d = document.documentElement.dataset.theme;
    if (isTheme(d)) return d;
  }
  if (typeof window === "undefined") return "dark"; // SSR / tests
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (isTheme(saved)) return saved;
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
    setTheme((t) => CYCLE[(CYCLE.indexOf(t) + 1) % CYCLE.length]);

  return { theme, toggle };
}
