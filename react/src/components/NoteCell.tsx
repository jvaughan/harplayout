import type { Note } from "../music/note";
import type { ViewOptions } from "../state/useHarpState";

const CATEGORY_LABEL: Record<string, string> = {
  chord: "Chord note",
  blue: "Blue note",
  passing: "Passing note",
  danger: "Danger note",
};

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
  if (!note) {
    return <td className="cell empty" />;
  }

  const visible = isTypeVisible(note, view);
  const title = `${note.description}\nInterval: ${note.positionInterval}\nNote: ${note.note}\n${CATEGORY_LABEL[note.intervalCategory]}`;

  return (
    <td
      className={`cell ${note.type}${visible ? "" : " hidden-note"}`}
      title={visible ? title : undefined}
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
    </td>
  );
}
