import type { Key } from "../music/harmonica";
import { allKeys } from "../music/musicLogic";
import { availableTunings } from "../music/tunings";
import type { UseHarpState } from "../state/useHarpState";

const KEYS = allKeys();
const POSITIONS = Array.from({ length: 12 }, (_, i) => i + 1);
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
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <label className="field">
      <span>Position</span>
      <select value={value} onChange={(e) => onChange(Number(e.target.value))}>
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

  return (
    <section className="calculators">
      <label className="field tuning">
        <span>Tuning</span>
        <select
          value={harp.tuning}
          onChange={(e) => setTuning(e.target.value)}
        >
          {TUNINGS.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </label>

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
