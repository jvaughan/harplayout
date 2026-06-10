import { useRef, useState } from "react";
import type { Note } from "../music/note";
import type { ViewOptions } from "../state/useHarpState";
import { NoteTooltip } from "./NoteTooltip";
import { CATEGORY_LABEL } from "./noteLabels";

// Whether a note's type is currently shown given the include* toggles.
function isTypeVisible(note: Note, view: ViewOptions): boolean {
  switch (note.type) {
    case "blowbend":
    case "drawbend":
      return view.includeBends;
    case "overblow":
    case "overdraw":
      return view.includeOverbends;
    case "unnecessary_overblow":
    case "unnecessary_overdraw":
      return view.includeUnnecessaryOverbends;
    default:
      return true; // natural
  }
}

export function NoteCell({
  note,
  view,
}: {
  note: Note | null;
  view: ViewOptions;
}) {
  const tdRef = useRef<HTMLTableCellElement>(null);
  // null = hidden; otherwise the viewport coords to anchor the tooltip above.
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null);

  if (!note) {
    return <td className="cell empty" />;
  }

  const visible = isTypeVisible(note, view);
  const categoryLabel = CATEGORY_LABEL[note.intervalCategory];
  // Keep the textual description for screen readers (we dropped the native title).
  const ariaLabel = `${note.description}. Interval ${note.positionInterval}, note ${note.note}, ${categoryLabel}`;

  const showTip = () => {
    const el = tdRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setTip({ top: r.top, left: r.left + r.width / 2 });
  };
  const hideTip = () => setTip(null);

  return (
    <td
      ref={tdRef}
      className={`cell ${note.type}${visible ? "" : " hidden-note"}`}
      aria-label={visible ? ariaLabel : undefined}
      onMouseEnter={visible ? showTip : undefined}
      onMouseLeave={hideTip}
      onFocus={visible ? showTip : undefined}
      onBlur={hideTip}
    >
      <div className="note-inner">
        {view.showIntervals && (
          <span className="interval">{note.positionInterval}</span>
        )}
        {view.showNotes && <span className="note-name">{note.note}</span>}
        {view.showIntervalCategories && (
          <span className={`cat-dot ${note.intervalCategory}`} aria-hidden>
            ●
          </span>
        )}
      </div>

      {visible && tip && <NoteTooltip note={note} pos={tip} />}
    </td>
  );
}
