import { useState } from "react";
import type { Key, Position } from "../music/harmonica";
import { allKeys } from "../music/musicLogic";
import { availableTunings } from "../music/tunings";
import type { UseHarpState } from "../state/useHarpState";
import { TuningEditor } from "./TuningEditor";

const KEYS = allKeys();
const POSITIONS = Array.from({ length: 12 }, (_, i) => (i + 1) as Position);
const TUNINGS = availableTunings();

function KeySelect({
  value,
  onChange,
  label,
}: {
  value: Key;
  onChange: (v: Key) => void;
  label: string;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      {/* DOM-boundary cast: options are exactly KEYS (= allKeys()), all valid. */}
      <select value={value} onChange={(e) => onChange(e.target.value as Key)}>
        {KEYS.map((k) => (
          <option key={k} value={k}>
            {k}
          </option>
        ))}
      </select>
    </label>
  );
}

function PositionSelect({
  value,
  onChange,
}: {
  value: Position;
  onChange: (v: Position) => void;
}) {
  return (
    <label className="field">
      <span>Position</span>
      {/* DOM-boundary cast: options are exactly POSITIONS (1..12), all valid. */}
      <select
        value={value}
        onChange={(e) => onChange(Number(e.target.value) as Position)}
      >
        {POSITIONS.map((p) => (
          <option key={p} value={p}>
            {p}
          </option>
        ))}
      </select>
    </label>
  );
}

function Result({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="field result">
      <span>{label}</span>
      <output>{value}</output>
    </div>
  );
}

export function CalculatorBar({ store }: { store: UseHarpState }) {
  const { harp, setTuning, songCalc, harpCalc, posCalc } = store;
  const [editing, setEditing] = useState(false);
  const isCustom = harp.tuning === "Custom";

  return (
    <section className="calculators">
      <div className="tuning-row">
        <label className="field tuning">
          <span>Tuning</span>
          <select value={harp.tuning} onChange={(e) => setTuning(e.target.value)}>
            {isCustom && <option value="Custom">Custom</option>}
            {TUNINGS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="edit-tuning-toggle"
          aria-expanded={editing}
          onClick={() => setEditing((v) => !v)}
        >
          {editing ? "Done editing" : "Edit tuning"}
        </button>
      </div>

      {editing && <TuningEditor store={store} />}

      <div className="calc-grid">
        <div className="calc-card">
          <h3>Get song key</h3>
          <KeySelect
            label="Harp key"
            value={harp.harpKey}
            onChange={songCalc.harpKey}
          />
          <PositionSelect value={harp.position} onChange={songCalc.position} />
          <Result label="Song key" value={harp.songKey} />
        </div>

        <div className="calc-card">
          <h3>Get harp key</h3>
          <KeySelect
            label="Song key"
            value={harp.songKey}
            onChange={harpCalc.songKey}
          />
          <PositionSelect value={harp.position} onChange={harpCalc.position} />
          <Result label="Harp key" value={harp.harpKey} />
        </div>

        <div className="calc-card">
          <h3>Get position</h3>
          <KeySelect
            label="Harp key"
            value={harp.harpKey}
            onChange={posCalc.harpKey}
          />
          <KeySelect
            label="Song key"
            value={harp.songKey}
            onChange={posCalc.songKey}
          />
          <Result label="Position" value={harp.position} />
        </div>
      </div>
    </section>
  );
}
