import type { HarpLayout } from "../music/harmonica";
import type { Note } from "../music/note";
import type { ViewOptions } from "../state/useHarpState";
import { NoteCell } from "./NoteCell";

function NoteRow({
  row,
  view,
  heading,
}: {
  row: (Note | null)[];
  view: ViewOptions;
  heading?: string;
}) {
  return (
    <tr>
      <th className="row-heading">{heading ?? ""}</th>
      {row.map((note, i) => (
        <NoteCell key={i} note={note} view={view} />
      ))}
    </tr>
  );
}

export function HarpTable({
  harp,
  view,
}: {
  harp: HarpLayout;
  view: ViewOptions;
}) {
  const blowLast = harp.blowRows.length - 1; // natural row sits at the bottom
  // Remount the table (not the scroll container) whenever the grid's identity
  // changes, replaying the subtle .harmonica fade-in. View toggles aren't part
  // of the signature, so they stay instant.
  const signature = `${harp.tuning}|${harp.harpKey}|${harp.songKey}|${harp.position}`;
  return (
    <div className="harp-wrap">
      <table key={signature} className="harmonica">
        <tbody>
          {harp.blowRows.map((row, i) => (
            <NoteRow
              key={`blow-${i}`}
              row={row}
              view={view}
              heading={i === blowLast ? "Blow" : ""}
            />
          ))}

          <tr className="holenums">
            <th className="row-heading">Hole</th>
            {harp.holeNums.map((n) => (
              <td key={n} className="holenum">
                {n}
              </td>
            ))}
          </tr>

          {harp.drawRows.map((row, i) => (
            <NoteRow
              key={`draw-${i}`}
              row={row}
              view={view}
              heading={i === 0 ? "Draw" : ""}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
