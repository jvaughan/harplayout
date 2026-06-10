import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("App", () => {
  it("renders the default layout without throwing", () => {
    const html = renderToStaticMarkup(<App />);
    // Default: Richter, C harp, 1st position, song key C.
    expect(html).toContain("Harp Layout");
    expect(html).toContain("position harp in the key of");
    // A few expected natural notes from the C Richter blow row.
    expect(html).toContain("Blow");
    expect(html).toContain("Draw");
    expect(html).toContain("Hole");
    // The three calculators.
    expect(html).toContain("Get song key");
    expect(html).toContain("Get harp key");
    expect(html).toContain("Get position");
  });
});
