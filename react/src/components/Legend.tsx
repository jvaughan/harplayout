import type { ViewOptions } from "../state/useHarpState";

export function Legend({ view }: { view: ViewOptions }) {
  const showOver = view.includeOverbends || view.includeUnnecessaryOverbends;
  return (
    <div className="legend">
      <h4>Legend</h4>
      <ul className="swatches">
        <li>
          <span className="swatch natural" /> Natural
        </li>
        {view.includeBends && (
          <li>
            <span className="swatch blowbend" /> Bend
          </li>
        )}
        {showOver && (
          <li>
            <span className="swatch overblow" /> Overblow / Overdraw
          </li>
        )}
      </ul>

      {view.showIntervalCategories && (
        <ul className="categories">
          <li>
            <span className="cat-dot chord">●</span> Chord note
          </li>
          <li>
            <span className="cat-dot blue">●</span> Blue note
          </li>
          <li>
            <span className="cat-dot passing">●</span> Passing note
          </li>
          <li>
            <span className="cat-dot danger">●</span> Danger note
          </li>
        </ul>
      )}
    </div>
  );
}
