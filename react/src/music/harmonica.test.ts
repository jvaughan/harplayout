import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildHarp, type HarpLayout } from "./harmonica";
import { TUNINGS } from "./tunings";

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

// On a real harp only the higher-pitched reed of a hole can be bent and only
// the lower-pitched reed can be overbent. Intervals are pitch classes with no
// octave, so when blow and draw sit far apart the order is ambiguous; we then
// assume the DRAW reed is higher. None of the stock tunings has such a hole, so
// we register a throwaway tuning to exercise the boundary cases. (Regression:
// previously both reeds got bends, and the overbend landed on the wrong reed.)
describe("ambiguous blow/draw order -> draw assumed higher", () => {
  const TEST_TUNING = "__test_ambiguous_order";

  beforeAll(() => {
    TUNINGS[TEST_TUNING] = {
      // hole 1: blow 1 / draw 5  — a fifth apart  -> draw higher
      // hole 2: blow 1 / draw b5 — a tritone apart -> draw higher (ambiguous)
      // hole 3: blow 5 / draw 1  — the mirror      -> draw higher
      // hole 4: blow 1 / draw 7  — draw clearly below blow -> blow higher
      blow: ["1", "1", "5", "1"],
      draw: ["5", "b5", "1", "7"],
    };
  });

  afterAll(() => {
    delete TUNINGS[TEST_TUNING];
  });

  // All notes (natural + bends + overbends) for a hole, per plate.
  function holeNotes(h: HarpLayout, hole: number) {
    const col = hole - 1;
    const collect = (rows: HarpLayout["blowRows"]) =>
      rows.map((r) => r[col]).filter((c): c is NonNullable<typeof c> => !!c);
    return { blow: collect(h.blowRows), draw: collect(h.drawRows) };
  }

  const isBend = (t: string) => t === "blowbend" || t === "drawbend";
  const isOverbend = (t: string) => t.includes("over"); // (unnecessary_)over(blow|draw)

  // 1st position on a C harp with the song in C: position interval == first-pos
  // interval, so `firstPosInterval` reads as a concrete interval here.
  const harp = () =>
    buildHarp({
      tuning: TEST_TUNING,
      harpKey: "C",
      position: 1,
      songKey: "C",
      calculate: "song_key",
    });

  it("never gives one hole bends on both reeds, or an overbend on the bending reed", () => {
    const h = harp();
    for (const hole of [1, 2, 3, 4]) {
      const { blow, draw } = holeNotes(h, hole);
      const blowBends = blow.some((n) => isBend(n.type));
      const drawBends = draw.some((n) => isBend(n.type));
      // At most one reed bends per hole.
      expect(blowBends && drawBends).toBe(false);
      // The reed that bends never also carries an overbend.
      if (blowBends) expect(blow.some((n) => isOverbend(n.type))).toBe(false);
      if (drawBends) expect(draw.some((n) => isOverbend(n.type))).toBe(false);
    }
  });

  it("blow 1 / draw 5 (a fifth): draw bends, blow overblows", () => {
    const { blow, draw } = holeNotes(harp(), 1);

    // Draw (higher) bends down toward blow, no overdraw.
    expect(draw.filter((n) => isBend(n.type)).map((n) => n.firstPosInterval)).toEqual(
      ["b5", "4", "3", "b3", "2", "b2"],
    );
    expect(draw.some((n) => isOverbend(n.type))).toBe(false);
    // The deepest bend (b2) used to be mislabeled an overdraw by the old code.
    expect(draw.find((n) => n.firstPosInterval === "b2")?.type).toBe("drawbend");

    // Blow (lower) overblows one semitone above draw, no blow bend.
    expect(blow.some((n) => isBend(n.type))).toBe(false);
    const overblow = blow.find((n) => isOverbend(n.type));
    expect(overblow?.type).toBe("overblow");
    expect(overblow?.firstPosInterval).toBe("b6");
  });

  it("blow 1 / draw b5 (a tritone): draw assumed higher, so draw bends and blow overblows", () => {
    const { blow, draw } = holeNotes(harp(), 2);
    expect(draw.some((n) => n.type === "drawbend")).toBe(true);
    expect(draw.some((n) => isOverbend(n.type))).toBe(false);
    expect(blow.some((n) => isBend(n.type))).toBe(false);
    // (Flagged unnecessary here, since `5` also exists as hole 3's blow natural.)
    expect(blow.some((n) => n.type.endsWith("overblow"))).toBe(true);
  });

  it("blow 5 / draw 1 (the mirror): draw still assumed higher", () => {
    const { blow, draw } = holeNotes(harp(), 3);
    expect(draw.some((n) => n.type === "drawbend")).toBe(true);
    expect(draw.some((n) => isOverbend(n.type))).toBe(false);
    expect(blow.some((n) => n.type === "overblow")).toBe(true);
  });

  it("blow 1 / draw 7 (draw clearly below blow): blow is higher, draw overdraws", () => {
    const { blow, draw } = holeNotes(harp(), 4);
    // Blow is the higher reed; only 1 semitone above draw so it can't bend.
    expect(blow.some((n) => isBend(n.type))).toBe(false);
    expect(blow.some((n) => isOverbend(n.type))).toBe(false);
    // Draw (lower) overdraws one semitone above blow.
    const overdraw = draw.find((n) => isOverbend(n.type));
    expect(overdraw?.type).toBe("overdraw");
    expect(overdraw?.firstPosInterval).toBe("b2");
  });
});
