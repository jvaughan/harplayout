import { useState } from "react";
import type { Interval, Position } from "../music/circleOfFifths";
import { noteFromKeyInterval, VALID_INTERVALS } from "../music/musicLogic";
import { getTuning, TUNINGS, type Tuning } from "../music/tunings";
import type { UseHarpState } from "../state/useHarpState";

const LABEL_POSITIONS = Array.from({ length: 12 }, (_, i) => (i + 1) as Position);

export function TuningEditor({ store }: { store: UseHarpState }) {
  const { harp, customTuning, editTuning, setTuning } = store;

  // The registry tuning this edit session started from (for "Reset"). Captured
  // once when the editor mounts; falls back to Richter if we opened on a custom
  // tuning loaded from a share link.
  const [baseName] = useState(() =>
    harp.tuning in TUNINGS ? harp.tuning : "Richter",
  );

  // Working definition: the active custom edit, or the named tuning we started
  // from. Registry arrays are never mutated — every edit produces fresh arrays.
  const working: Tuning = customTuning ?? getTuning(harp.tuning);
  const { blow, draw, labelPosition } = working;
  const holes = blow.length;

  const apply = (patch: Partial<Tuning>) =>
    editTuning({
      blow: patch.blow ?? blow.slice(),
      draw: patch.draw ?? draw.slice(),
      labelPosition: patch.labelPosition ?? labelPosition,
    });

  const setCell = (plate: "blow" | "draw", i: number, value: Interval) => {
    const next = (plate === "blow" ? blow : draw).slice();
    next[i] = value;
    apply({ [plate]: next });
  };

  const addHole = () =>
    apply({ blow: [...blow, "1"], draw: [...draw, "1"] });

  const removeHole = () => {
    if (holes <= 1) return;
    apply({ blow: blow.slice(0, -1), draw: draw.slice(0, -1) });
  };

  const Cell = ({ plate, i }: { plate: "blow" | "draw"; i: number }) => {
    const value = (plate === "blow" ? blow : draw)[i];
    return (
      <select
        aria-label={`${plate} hole ${i + 1}`}
        value={value}
        onChange={(e) => setCell(plate, i, e.target.value as Interval)}
      >
        {VALID_INTERVALS.map((iv) => (
          <option key={iv} value={iv}>
            {iv} — {noteFromKeyInterval(harp.harpKey, iv)}
          </option>
        ))}
      </select>
    );
  };

  const holeIndexes = Array.from({ length: holes }, (_, i) => i);

  return (
    <div className="tuning-editor">
      <p className="tuning-editor-hint">
        Edit the natural notes (first-position intervals). Notes shown for the
        current harp key <strong>{harp.harpKey}</strong>. Bends and overbends
        recalculate automatically.
      </p>

      <div className="tuning-editor-grid" role="group" aria-label="Tuning notes">
        <div className="te-row te-head">
          <span className="te-rowlabel" />
          {holeIndexes.map((i) => (
            <span key={i} className="te-holenum">
              {i + 1}
            </span>
          ))}
        </div>
        <div className="te-row">
          <span className="te-rowlabel">Blow</span>
          {holeIndexes.map((i) => (
            <Cell key={i} plate="blow" i={i} />
          ))}
        </div>
        <div className="te-row">
          <span className="te-rowlabel">Draw</span>
          {holeIndexes.map((i) => (
            <Cell key={i} plate="draw" i={i} />
          ))}
        </div>
      </div>

      <div className="tuning-editor-controls">
        <div className="te-holes">
          <button type="button" onClick={removeHole} disabled={holes <= 1}>
            − Remove hole
          </button>
          <button type="button" onClick={addHole}>
            + Add hole
          </button>
        </div>

        <label className="field te-labelpos">
          <span>Label position</span>
          <select
            value={labelPosition ?? 1}
            onChange={(e) =>
              apply({ labelPosition: Number(e.target.value) as Position })
            }
          >
            {LABEL_POSITIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <button
          type="button"
          className="te-reset"
          onClick={() => setTuning(baseName)}
        >
          Reset to {baseName}
        </button>
      </div>
    </div>
  );
}
