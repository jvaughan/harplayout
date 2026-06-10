// Human-readable labels for a note's interval category. Shared by NoteCell
// (aria-label) and NoteTooltip; kept in its own module so the component files
// only export components (react-refresh/only-export-components).
export const CATEGORY_LABEL: Record<string, string> = {
  chord: "Chord note",
  blue: "Blue note",
  passing: "Passing note",
  danger: "Danger note",
};
