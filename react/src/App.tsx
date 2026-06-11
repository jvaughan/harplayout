import { CalculatorBar } from "./components/CalculatorBar";
import { HarpTable } from "./components/HarpTable";
import { Legend } from "./components/Legend";
import { ShareButton } from "./components/ShareButton";
import { ThemeToggle } from "./components/ThemeToggle";
import { ViewOptions } from "./components/ViewOptions";
import { useHarpState } from "./state/useHarpState";
import { useTheme } from "./state/useTheme";

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export default function App() {
  const store = useHarpState();
  const { harp, view, toggle } = store;
  const { theme, toggle: toggleTheme } = useTheme();

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-text">
          <h1>Harp Layout</h1>
          <p className="tagline">
            Harmonica tablature for any tuning, key & position
          </p>
        </div>
        <ThemeToggle theme={theme} toggle={toggleTheme} />
      </header>

      <CalculatorBar store={store} />

      <h2 className="summary">
        {ordinal(harp.position)} position harp in the key of{" "}
        <strong>{harp.harpKey}</strong> for a song in{" "}
        <strong>{harp.songKey}</strong>
        <span className="summary-tuning"> · {harp.tuning} tuning</span>
      </h2>

      <div className="share-row">
        <ShareButton harp={harp} />
      </div>

      <div className="harp-and-options">
        <HarpTable harp={harp} view={view} />
        <aside className="options-panel">
          <ViewOptions view={view} toggle={toggle} />
          <Legend view={view} />
        </aside>
      </div>

      <footer className="app-footer">
        <p id="copyright">
          © <a href="mailto:jon-web@harplayout.com">Jon Vaughan</a>
        </p>
      </footer>
    </div>
  );
}
