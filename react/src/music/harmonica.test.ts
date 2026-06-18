import { describe, expect, it } from "vitest";
import { buildHarp, type HarpLayout } from "./harmonica";
import { getTuning } from "./tunings";

// Render a harp layout to a compact text grid for snapshotting.
// Each cell: "<positionInterval>/<note>/<type>" or "." for empty.
function render(h: HarpLayout): string {
  const cell = (c: (typeof h.blowRows)[number][number]) =>
    c ? `${c.positionInterval}/${c.note}/${c.type}` : ".";
  const rowText = (row: (typeof h.blowRows)[number]) =>
    row.map(cell).join("\t");

  const lines: string[] = [];
  lines.push(
    `tuning=${h.tuning} harp=${h.harpKey} song=${h.songKey} pos=${h.position} holes=${h.numHoles}`,
  );
  lines.push("-- blow (top..bottom) --");
  h.blowRows.forEach((r) => lines.push(rowText(r)));
  lines.push("holes: " + h.holeNums.join("\t"));
  lines.push("-- draw (top..bottom) --");
  h.drawRows.forEach((r) => lines.push(rowText(r)));
  return lines.join("\n");
}

describe("buildHarp grids (pinned snapshots)", () => {
  it("Richter, C harp, 2nd position", () => {
    const h = buildHarp({
      tuning: "Richter",
      harpKey: "C",
      position: 2,
      songKey: "G",
      calculate: "song_key",
    });
    expect(h.songKey).toBe("G");
    expect(render(h)).toMatchSnapshot();
  });

  it("Richter, C harp, 1st position", () => {
    const h = buildHarp({
      tuning: "Richter",
      harpKey: "C",
      position: 1,
      songKey: "C",
      calculate: "song_key",
    });
    expect(h.songKey).toBe("C");
    expect(render(h)).toMatchSnapshot();
  });

  it("Natural Minor (labelled 2nd pos), C harp, position 2", () => {
    const h = buildHarp({
      tuning: "L.O Natural Minor (labelled in 2nd pos)",
      harpKey: "C",
      position: 2,
      songKey: "G",
      calculate: "song_key",
    });
    expect(render(h)).toMatchSnapshot();
  });

  it("calculates harp key from song key + position", () => {
    const h = buildHarp({
      tuning: "Richter",
      harpKey: "C",
      position: 2,
      songKey: "G",
      calculate: "harp_key",
    });
    // 2nd position, song in G -> C harp.
    expect(h.harpKey).toBe("C");
  });

  it("calculates position from harp key + song key", () => {
    const h = buildHarp({
      tuning: "Richter",
      harpKey: "C",
      position: 1,
      songKey: "G",
      calculate: "position",
    });
    expect(h.position).toBe(2);
  });
});

describe("custom tunings (tuningDef override)", () => {
  // The natural blow note for a hole is bendstep 0 — the bottom row of blowRows
  // (which are stored highest-bend-first), at the hole's column.
  const blowNatural = (h: HarpLayout, hole: number) =>
    h.blowRows[h.blowRows.length - 1][hole - 1];

  it("a tuningDef equal to the registry entry reproduces the named grid exactly", () => {
    const named = buildHarp({
      tuning: "Richter",
      harpKey: "C",
      position: 2,
      songKey: "G",
      calculate: "song_key",
    });
    const viaDef = buildHarp({
      tuning: "Richter",
      tuningDef: getTuning("Richter"),
      harpKey: "C",
      position: 2,
      songKey: "G",
      calculate: "song_key",
    });
    // Whole grid (naturals + bends + overbends) matches, not just the inputs.
    expect(render(viaDef)).toBe(render(named));
  });

  it("honours a custom labelPosition without consulting the registry", () => {
    // Same arrays as the named 2nd-pos natural minor, but a placeholder name —
    // a name lookup would throw, so this also guards the labelPos fallback bug.
    const def = getTuning("L.O Natural Minor (labelled in 2nd pos)");
    const named = buildHarp({
      tuning: "L.O Natural Minor (labelled in 2nd pos)",
      harpKey: "C",
      position: 2,
      songKey: "G",
      calculate: "song_key",
    });
    const custom = buildHarp({
      tuning: "Custom",
      tuningDef: { blow: def.blow, draw: def.draw, labelPosition: 2 },
      harpKey: "C",
      position: 2,
      songKey: "G",
      calculate: "song_key",
    });
    expect(custom.songKey).toBe(named.songKey);
    expect(custom.labelPosition).toBe(2);
  });

  it("defaults an absent labelPosition to 1 (no registry lookup for 'Custom')", () => {
    expect(() =>
      buildHarp({
        tuning: "Custom",
        tuningDef: { blow: ["1", "3", "5"], draw: ["2", "5", "7"] },
        harpKey: "C",
        position: 1,
        songKey: "C",
        calculate: "song_key",
      }),
    ).not.toThrow();
    const h = buildHarp({
      tuning: "Custom",
      tuningDef: { blow: ["1", "3", "5"], draw: ["2", "5", "7"] },
      harpKey: "C",
      position: 1,
      songKey: "C",
      calculate: "song_key",
    });
    expect(h.labelPosition).toBe(1);
  });

  it("supports an arbitrary hole count from the definition", () => {
    const h = buildHarp({
      tuning: "Custom",
      tuningDef: { blow: ["1", "3", "5", "1"], draw: ["2", "5", "7", "2"] },
      harpKey: "C",
      position: 1,
      songKey: "C",
      calculate: "song_key",
    });
    expect(h.numHoles).toBe(4);
    expect(h.holeNums).toEqual([1, 2, 3, 4]);
    expect(h.blowRows.every((r) => r.length === 4)).toBe(true);
  });

  it("editing a natural note changes that hole's note and its bends", () => {
    const base = getTuning("Richter");
    const edited = base.blow.slice();
    edited[0] = "b3"; // hole 1 blow: 1 -> b3
    const h = buildHarp({
      tuning: "Custom",
      tuningDef: { blow: edited, draw: base.draw },
      harpKey: "C",
      position: 1,
      songKey: "C",
      calculate: "song_key",
    });
    // The natural note now reflects the edit (b3 of C = Eb in 1st position).
    expect(blowNatural(h, 1)!.firstPosInterval).toBe("b3");
    expect(blowNatural(h, 1)!.note).toBe("Eb");
    // Hole 1 still resolves naturals for the untouched holes.
    expect(blowNatural(h, 2)!.firstPosInterval).toBe("3");
  });
});
