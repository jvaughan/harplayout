// Responsive-layout tests that run in a *real* browser (Vitest Browser Mode,
// Playwright/chromium). Unlike the node/jsdom suite, this environment computes
// an actual box model and resolves `@media` queries against the viewport, so we
// can assert the layout invariants that `src/styles/app.css` documents as
// fragile — the ones plain text-matching (ui.test.tsx) can't verify.
//
// Run just this suite with: `vitest --project browser`.
import { cleanup, render } from "@testing-library/react";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import App from "../App";
import "../styles/app.css";

// Resize the viewport and let the browser re-evaluate media queries / relayout
// before we read computed styles. Two rAFs ensures style + layout have settled.
async function setViewport(width: number, height = 900) {
  await page.viewport(width, height);
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

// One rem in CSS pixels (no root font-size override, so this is the browser
// default of 16, but read it so the assertions don't silently break if that
// ever changes).
function remPx(): number {
  return parseFloat(getComputedStyle(document.documentElement).fontSize);
}

function px(el: Element, prop: string): number {
  return parseFloat(getComputedStyle(el).getPropertyValue(prop));
}

beforeEach(() => {
  render(<App />);
});

afterEach(() => {
  cleanup();
});

describe(".calc-grid: 3-across or fully stacked, never 2 + 1", () => {
  function trackCount(): number {
    const grid = document.querySelector(".calc-grid")!;
    // Computed `grid-template-columns` is a space-separated list of resolved
    // track sizes ("224px 224px 224px"); the count is the number of columns.
    return getComputedStyle(grid).gridTemplateColumns.trim().split(/\s+/).length;
  }

  it("is 3 columns at 700px (≥600px breakpoint)", async () => {
    await setViewport(700);
    expect(trackCount()).toBe(3);
  });

  it("collapses to 1 column at 599px (just below the breakpoint)", async () => {
    await setViewport(599);
    expect(trackCount()).toBe(1);
  });

  it("is exactly 3 columns at the 600px boundary (min-width is inclusive)", async () => {
    await setViewport(600);
    expect(trackCount()).toBe(3);
  });
});

describe("harp cell min-width shrinks across the 600/500/400 tiers", () => {
  function cellMinWidthRem(): number {
    const cell = document.querySelector("td.cell, td.holenum")!;
    return px(cell, "min-width") / remPx();
  }

  // The base rule and the three max-width tiers, with one probe width inside
  // each band. min-width is the property that actually drives the harp fit.
  it.each([
    { width: 800, rem: 2.9 }, // base (above all tiers)
    { width: 600, rem: 2.4 }, // ≤600 tier (max-width is inclusive)
    { width: 500, rem: 2.0 }, // ≤500 tier
    { width: 400, rem: 1.75 }, // ≤400 tier
  ])("is $rem rem at viewport $width px", async ({ width, rem }) => {
    await setViewport(width);
    expect(cellMinWidthRem()).toBeCloseTo(rem, 2);
  });

  it("decreases monotonically as the viewport narrows", async () => {
    const widths = [800, 600, 500, 400];
    const widthsToMin: number[] = [];
    for (const w of widths) {
      await setViewport(w);
      widthsToMin.push(cellMinWidthRem());
    }
    for (let i = 1; i < widthsToMin.length; i++) {
      expect(widthsToMin[i]).toBeLessThan(widthsToMin[i - 1]);
    }
  });
});

// The plan accepts that a custom tuning wider than the viewport scrolls rather
// than getting its own breakpoints — but the editor grid must actually be a
// scroll container (overflow-x), which only a real layout can confirm.
describe("tuning editor grid scrolls horizontally when it overflows", () => {
  it("overflows its content (scrollWidth > clientWidth) at a narrow width", async () => {
    await setViewport(400);
    fireEvent.click(screen.getByRole("button", { name: "Edit tuning" }));
    // Richter starts at 10 holes; add 10 more so the row is far wider than 400px.
    const add = screen.getByRole("button", { name: /Add hole/ });
    for (let i = 0; i < 10; i++) fireEvent.click(add);
    await setViewport(400); // relayout after the DOM grew

    const grid = document.querySelector(".tuning-editor-grid") as HTMLElement;
    expect(getComputedStyle(grid).overflowX).toBe("auto");
    expect(grid.scrollWidth).toBeGreaterThan(grid.clientWidth);
  });
});
