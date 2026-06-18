// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "../App";

// Extract the body of a CSS rule (the text between { and }) for a selector.
function cssRule(selector: string): string {
  const css = readFileSync(resolve(process.cwd(), "src/styles/app.css"), "utf8");
  const at = css.indexOf(selector);
  if (at === -1) throw new Error(`selector not found: ${selector}`);
  return css.slice(css.indexOf("{", at) + 1, css.indexOf("}", at));
}

// Each test mounts App fresh; reset theme side-effects and the URL (share params
// are read from it on mount) between tests.
beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
  window.history.pushState({}, "", "/");
});

// The <output> in a calculator card holds its computed value.
function card(headingText: string): HTMLElement {
  const heading = screen.getByRole("heading", { name: headingText });
  return heading.closest(".calc-card") as HTMLElement;
}

function result(headingText: string): string {
  return card(headingText).querySelector("output")!.textContent ?? "";
}

const table = () => document.querySelector("table.harmonica") as HTMLElement;

describe("theme switcher", () => {
  it("defaults to dark and toggles to light, persisting the choice", () => {
    render(<App />);
    const btn = screen.getByRole("button", { name: /Light|Dark/ });

    // Default (no stored pref, no matchMedia in jsdom) is dark.
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(btn.textContent).toContain("Light"); // offers the opposite

    fireEvent.click(btn);
    expect(document.documentElement.dataset.theme).toBe("light");
    expect(localStorage.getItem("harplayout-theme")).toBe("light");
    expect(btn.textContent).toContain("Dark");

    fireEvent.click(btn);
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem("harplayout-theme")).toBe("dark");
  });

  it("restores a stored theme on mount", () => {
    localStorage.setItem("harplayout-theme", "light");
    render(<App />);
    expect(document.documentElement.dataset.theme).toBe("light");
  });
});

describe("view options (pure render filters)", () => {
  it("hides note names when 'Note names' is unchecked", () => {
    render(<App />);
    expect(table().querySelectorAll(".note-name").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByLabelText("Note names"));
    expect(table().querySelectorAll(".note-name").length).toBe(0);
  });

  it("hides intervals when 'Intervals' is unchecked", () => {
    render(<App />);
    expect(table().querySelectorAll(".interval").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByLabelText("Intervals"));
    expect(table().querySelectorAll(".interval").length).toBe(0);
  });

  it("hides interval-category dots when unchecked", () => {
    render(<App />);
    expect(table().querySelectorAll(".cat-dot").length).toBeGreaterThan(0);

    fireEvent.click(screen.getByLabelText("Interval categories"));
    expect(table().querySelectorAll(".cat-dot").length).toBe(0);
  });

  it("dims bend cells (without removing them) when 'Bends' is unchecked", () => {
    render(<App />);
    expect(
      table().querySelectorAll(".cell.blowbend.hidden-note, .cell.drawbend.hidden-note")
        .length,
    ).toBe(0);

    fireEvent.click(screen.getByLabelText("Bends"));
    expect(
      table().querySelectorAll(".cell.blowbend.hidden-note, .cell.drawbend.hidden-note")
        .length,
    ).toBeGreaterThan(0);
  });

  it("renders hidden notes with no visible border outline", () => {
    // A hidden note should look as blank as an empty cell — no faint border.
    const rule = cssRule(".cell.hidden-note {");
    expect(rule).toMatch(/border-color:\s*transparent/);
    expect(rule).not.toMatch(/var\(--border\)/);
    expect(rule).not.toMatch(/dashed/);
  });
});

describe("note tooltip", () => {
  it("shows a styled tooltip with note details on hover, and hides on leave", () => {
    render(<App />);
    const cell = table().querySelector(".cell.natural") as HTMLElement;

    expect(document.querySelector(".note-tooltip")).toBeNull();

    fireEvent.mouseEnter(cell);
    const tip = document.querySelector(".note-tooltip") as HTMLElement;
    expect(tip).not.toBeNull();
    // Header + the Interval/Note rows are present.
    expect(tip.querySelector(".tt-header")!.textContent).toBeTruthy();
    expect(tip.textContent).toContain("Interval");
    expect(tip.textContent).toContain("Note");

    fireEvent.mouseLeave(cell);
    expect(document.querySelector(".note-tooltip")).toBeNull();
  });

  it("does not use the native title attribute", () => {
    render(<App />);
    const cell = table().querySelector(".cell.natural") as HTMLElement;
    expect(cell.getAttribute("title")).toBeNull();
    // ...but keeps an accessible label for screen readers.
    expect(cell.getAttribute("aria-label")).toContain("Interval");
  });
});

describe("harp table", () => {
  it("renders Blow / Hole / Draw headings and 10 holes for Richter", () => {
    render(<App />);
    expect(table().textContent).toContain("Blow");
    expect(table().textContent).toContain("Draw");
    expect(table().textContent).toContain("Hole");
    expect(table().querySelectorAll(".holenum").length).toBe(10);
  });

  it("re-renders with 12 holes when a 12-hole tuning is selected", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Tuning"), {
      target: { value: "Solo (12 hole)" },
    });
    expect(table().querySelectorAll(".holenum").length).toBe(12);
  });
});

describe("tuning editor", () => {
  const openEditor = () =>
    fireEvent.click(screen.getByRole("button", { name: "Edit tuning" }));

  it("interval options are labelled with the note in the current harp key", () => {
    render(<App />); // default C harp
    openEditor();
    const blow1 = screen.getByLabelText("blow hole 1") as HTMLSelectElement;
    const labels = [...blow1.options].map((o) => o.textContent);
    expect(labels).toContain("1 — C");
    expect(labels).toContain("3 — E");
  });

  it("editing a natural note switches the tuning to Custom", () => {
    render(<App />);
    openEditor();
    fireEvent.change(screen.getByLabelText("blow hole 1"), {
      target: { value: "b3" },
    });
    const summary = document.querySelector(".summary")!.textContent ?? "";
    expect(summary).toContain("Custom");
  });

  it("adds and removes holes, keeping the harp in sync", () => {
    render(<App />);
    openEditor();
    expect(table().querySelectorAll(".holenum").length).toBe(10);
    fireEvent.click(screen.getByRole("button", { name: /Add hole/ }));
    expect(table().querySelectorAll(".holenum").length).toBe(11);
    fireEvent.click(screen.getByRole("button", { name: /Remove hole/ }));
    fireEvent.click(screen.getByRole("button", { name: /Remove hole/ }));
    expect(table().querySelectorAll(".holenum").length).toBe(9);
  });

  it("names a custom tuning, showing the name in the summary and dropdown", () => {
    render(<App />);
    openEditor();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "My Tuning" },
    });
    // Display surfaces flag a user-named custom tuning with " (custom)".
    expect(document.querySelector(".summary")!.textContent).toContain(
      "My Tuning (custom)",
    );
    // The dropdown option's value stays the raw name; its label gets the suffix.
    const select = screen.getByLabelText("Tuning") as HTMLSelectElement;
    expect(select.value).toBe("My Tuning");
    const opt = [...select.options].find((o) => o.value === "My Tuning")!;
    expect(opt.textContent).toContain("My Tuning (custom)");
  });

  it("rejects a name that clashes with a registry tuning", () => {
    render(<App />);
    openEditor();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "Country" },
    });
    expect(screen.getByRole("alert").textContent).toMatch(/already a tuning/i);
    // The clashing name is not committed.
    expect(document.querySelector(".summary")!.textContent).not.toContain(
      "Country",
    );
  });

  it("keeps a named custom tuning in the dropdown after switching away", () => {
    render(<App />);
    openEditor();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "My Tuning" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Done editing" }));

    const select = screen.getByLabelText("Tuning") as HTMLSelectElement;
    // Switch to a registry tuning...
    fireEvent.change(select, { target: { value: "Country" } });
    expect(document.querySelector(".summary")!.textContent).toContain("Country");
    // ...the custom tuning is still selectable...
    expect([...select.options].map((o) => o.value)).toContain("My Tuning");
    // ...and selecting it restores the custom layout.
    fireEvent.change(select, { target: { value: "My Tuning" } });
    expect(document.querySelector(".summary")!.textContent).toContain(
      "My Tuning",
    );
  });

  it("discard removes the custom tuning from the dropdown", () => {
    render(<App />);
    openEditor();
    fireEvent.change(screen.getByLabelText("Name"), {
      target: { value: "My Tuning" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Discard/ }));

    const select = screen.getByLabelText("Tuning") as HTMLSelectElement;
    expect([...select.options].map((o) => o.value)).not.toContain("My Tuning");
    expect(document.querySelector(".summary")!.textContent).toContain("Richter");
  });

  it("reset returns to the base registry tuning", () => {
    render(<App />);
    openEditor();
    fireEvent.change(screen.getByLabelText("draw hole 2"), {
      target: { value: "b7" },
    });
    expect(document.querySelector(".summary")!.textContent).toContain("Custom");
    fireEvent.click(screen.getByRole("button", { name: /reset to Richter/i }));
    expect(document.querySelector(".summary")!.textContent).toContain("Richter");
  });
});

describe("share button", () => {
  const writeText = vi.fn().mockResolvedValue(undefined);

  beforeEach(() => {
    writeText.mockClear();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
  });

  it("copies a link encoding the current layout and confirms", async () => {
    render(<App />);
    // C harp, 2nd position -> song key G.
    fireEvent.change(within(card("Get song key")).getByLabelText("Position"), {
      target: { value: "2" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Share this layout/ }));

    // Button confirms once the async clipboard write resolves.
    await screen.findByRole("button", { name: /Copied/ });
    expect(writeText).toHaveBeenCalledTimes(1);
    const url = writeText.mock.calls[0][0] as string;
    expect(url).toContain("t=Richter");
    expect(url).toContain("hk=C");
    expect(url).toContain("sk=G");
    expect(url).toContain("pos=2");
  });

  it("encodes the custom natural notes (cb/cd) after editing", async () => {
    render(<App />);
    fireEvent.click(screen.getByRole("button", { name: "Edit tuning" }));
    fireEvent.change(screen.getByLabelText("blow hole 1"), {
      target: { value: "b3" },
    });

    fireEvent.click(screen.getByRole("button", { name: /Share this layout/ }));
    await screen.findByRole("button", { name: /Copied/ });

    const url = writeText.mock.calls[0][0] as string;
    expect(url).toContain("t=Custom");
    expect(url).toContain("cb=");
    expect(url).toContain("cd=");
  });

  it("restores a custom tuning from share params on load", () => {
    window.history.pushState(
      {},
      "",
      "/?t=Custom&hk=C&sk=C&pos=1&cb=1,3,5,1,3,5&cd=2,5,7,2,4,6",
    );
    render(<App />);
    expect(document.querySelector(".summary")!.textContent).toContain("Custom");
    expect(table().querySelectorAll(".holenum").length).toBe(6);
  });

  it("restores the layout from share params in the URL on load", () => {
    window.history.pushState({}, "", "/?t=Paddy+Richter&hk=A&sk=E&pos=2");
    render(<App />);

    const summary = document.querySelector(".summary")!.textContent ?? "";
    expect(summary).toContain("2nd position");
    expect(summary).toContain("Paddy Richter");
    expect(summary).toContain("A"); // harp key
    expect(summary).toContain("E"); // song key
  });

  it("ignores invalid share params and falls back to defaults", () => {
    window.history.pushState({}, "", "/?t=Bogus&hk=H&pos=99");
    render(<App />);

    const summary = document.querySelector(".summary")!.textContent ?? "";
    expect(summary).toContain("1st position");
    expect(summary).toContain("Richter");
    expect(summary).not.toContain("Bogus");
  });
});

describe("calculators", () => {
  it("computes the song key from harp key + position", () => {
    render(<App />);
    const songCard = within(card("Get song key"));
    // C harp, 2nd position -> song key G.
    fireEvent.change(songCard.getByLabelText("Position"), {
      target: { value: "2" },
    });
    expect(result("Get song key")).toBe("G");
    const summary = document.querySelector(".summary")!.textContent ?? "";
    expect(summary).toContain("song in");
    expect(summary).toContain("G");
  });

  it("computes the harp key from song key + position", () => {
    render(<App />);
    const harpCard = within(card("Get harp key"));
    fireEvent.change(harpCard.getByLabelText("Song key"), {
      target: { value: "G" },
    });
    fireEvent.change(harpCard.getByLabelText("Position"), {
      target: { value: "2" },
    });
    // 2nd position, song G -> C harp.
    expect(result("Get harp key")).toBe("C");
  });

  it("computes the position from harp key + song key", () => {
    render(<App />);
    const posCard = within(card("Get position"));
    fireEvent.change(posCard.getByLabelText("Harp key"), {
      target: { value: "C" },
    });
    fireEvent.change(posCard.getByLabelText("Song key"), {
      target: { value: "G" },
    });
    expect(result("Get position")).toBe("2");
  });

  it("shows the selected tuning in the summary", () => {
    render(<App />);
    fireEvent.change(screen.getByLabelText("Tuning"), {
      target: { value: "Paddy Richter" },
    });
    expect(document.querySelector(".summary")!.textContent).toContain(
      "Paddy Richter",
    );
  });
});
