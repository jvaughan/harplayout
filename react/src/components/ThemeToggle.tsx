import type { Theme } from "../state/useTheme";

// What each theme switches *to* on the next click (dark → light → legacy → dark),
// and the icon/label to show for that next theme.
const NEXT: Record<Theme, { theme: Theme; icon: string; label: string }> = {
  dark: { theme: "light", icon: "☀️", label: "Light" },
  light: { theme: "legacy", icon: "🎵", label: "Legacy" },
  legacy: { theme: "dark", icon: "🌙", label: "Dark" },
};

export function ThemeToggle({
  theme,
  toggle,
}: {
  theme: Theme;
  toggle: () => void;
}) {
  const next = NEXT[theme];
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${next.label.toLowerCase()} theme`}
      title={`Switch to ${next.label} theme`}
    >
      <span aria-hidden>{next.icon}</span>
      <span>{next.label}</span>
    </button>
  );
}
