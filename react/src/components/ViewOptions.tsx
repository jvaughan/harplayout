import type { ViewOptions as ViewOptionsType } from "../state/useHarpState";

const INCLUDE: { key: keyof ViewOptionsType; label: string }[] = [
  { key: "includeBends", label: "Bends" },
  { key: "includeOverbends", label: "Overblows / Overdraws" },
  { key: "includeUnnecessaryOverbends", label: "Unnecessary OBs / ODs" },
];

const DISPLAY: { key: keyof ViewOptionsType; label: string }[] = [
  { key: "showNotes", label: "Note names" },
  { key: "showIntervals", label: "Intervals" },
  { key: "showIntervalCategories", label: "Interval categories" },
];

export function ViewOptions({
  view,
  toggle,
}: {
  view: ViewOptionsType;
  toggle: (key: keyof ViewOptionsType) => void;
}) {
  return (
    <div className="view-options">
      <fieldset>
        <legend>Include</legend>
        {INCLUDE.map(({ key, label }) => (
          <label key={key} className="check">
            <input
              type="checkbox"
              checked={view[key]}
              onChange={() => toggle(key)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      <fieldset>
        <legend>Show</legend>
        {DISPLAY.map(({ key, label }) => (
          <label key={key} className="check">
            <input
              type="checkbox"
              checked={view[key]}
              onChange={() => toggle(key)}
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>
    </div>
  );
}
