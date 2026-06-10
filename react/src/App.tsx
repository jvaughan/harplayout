import { CalculatorBar } from "./components/CalculatorBar";
import { HarpTable } from "./components/HarpTable";
import { Legend } from "./components/Legend";
import { ViewOptions } from "./components/ViewOptions";
import { useHarpState } from "./state/useHarpState";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function App() {
  const store = useHarpState();
  const { harp, view, toggle } = store;

  return (
    <div className="app">
      <header className="app-header">
        <h1>Harp Layout</h1>
        <p className="tagline">Harmonica tablature for any tuning, key & position</p>
      </header>

      <CalculatorBar store={store} />

      <h2 className="summary">
        {ordinal(harp.position)} position harp in the key of{" "}
        <strong>{harp.harpKey}</strong> for a song in{" "}
        <strong>{harp.songKey}</strong>
        <span className="summary-tuning"> · {harp.tuning} tuning</span>
      </h2>

      <div className="harp-and-options">
        <HarpTable harp={harp} view={view} />
        <aside className="options-panel">
          <ViewOptions view={view} toggle={toggle} />
          <Legend view={view} />
        </aside>
      </div>

      <footer className="app-footer">
        <p>
          Reimagined React build of HarpLayout. Bends, overbends and interval
          categories are computed entirely in the browser.
        </p>
      </footer>
    </div>
  );
}
