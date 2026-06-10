import { createPortal } from "react-dom";
import type { Note } from "../music/note";
import { CATEGORY_LABEL } from "./noteLabels";

// Portalled to <body> and anchored above the hovered cell (viewport coords in
// `pos`), so the table's overflow can't clip it. Mirrors the legacy Prototip
// box: header (description) + Interval / Note / Category rows.
export function NoteTooltip({
  note,
  pos,
}: {
  note: Note;
  pos: { top: number; left: number };
}) {
  return createPortal(
    <div
      className="note-tooltip"
      role="tooltip"
      style={{ top: pos.top, left: pos.left }}
    >
      <div className="tt-header">{note.description}</div>
      <div className="tt-rows">
        <div className="tt-row">
          <span className="tt-label">Interval</span>
          <span className="tt-val">{note.positionInterval}</span>
        </div>
        <div className="tt-row">
          <span className="tt-label">Note</span>
          <span className="tt-val">{note.note}</span>
        </div>
        <div className="tt-row tt-catrow">
          <span className={`cat-dot ${note.intervalCategory}`} aria-hidden>
            ●
          </span>
          {CATEGORY_LABEL[note.intervalCategory]}
        </div>
      </div>
      <span className="tt-arrow" aria-hidden />
    </div>,
    document.body,
  );
}
