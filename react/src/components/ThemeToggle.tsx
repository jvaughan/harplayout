import type { Theme } from "../state/useTheme";

export function ThemeToggle({
  theme,
  toggle,
}: {
  theme: Theme;
  toggle: () => void;
}) {
  const isDark = theme === "dark";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-pressed={isDark}
      title={`Switch to ${isDark ? "light" : "dark"} theme`}
    >
      <span aria-hidden>{isDark ? "☀️" : "🌙"}</span>
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}
