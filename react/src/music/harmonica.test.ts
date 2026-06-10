import { describe, expect, it } from "vitest";
import { buildHarp, type HarpLayout } from "./harmonica";

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
