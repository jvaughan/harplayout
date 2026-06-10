import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import {
  buildHarp,
  type Calculate,
  type HarpLayout,
  type Key,
} from "./harmonica";

// Mirror of dump_grid.pl / scripts/dumpGrid.ts output format.
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

interface Case {
  tuning: string;
  harpKey: Key;
  songKey: Key;
  position: number;
  calculate: Calculate;
}

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));

const cases: Case[] = JSON.parse(
  readFileSync(here("../../scripts/cases.json"), "utf8"),
);

// Parse the Perl fixture into a map: case-line -> grid text (no trailing newline).
const fixtureRaw = readFileSync(here("../../scripts/perl_fixture.txt"), "utf8");
const perlByKey = new Map<string, string>();
{
  let key: string | null = null;
  let buf: string[] = [];
  const flush = () => {
    if (key !== null) perlByKey.set(key, buf.join("\n"));
  };
  for (const line of fixtureRaw.split("\n")) {
    if (line.startsWith("@@@ ")) {
      flush();
      key = line.slice(4);
      buf = [];
    } else if (key !== null) {
      buf.push(line);
    }
  }
  flush();
}

function keyFor(c: Case): string {
  return `${c.tuning}|${c.harpKey}|${c.songKey}|${c.position}|${c.calculate}`;
}

describe("TS port matches Perl reference output", () => {
  it("covers the full case matrix", () => {
    expect(cases.length).toBeGreaterThan(1000);
    expect(perlByKey.size).toBe(cases.length);
  });

  for (const c of cases) {
    it(keyFor(c), () => {
      const expected = perlByKey.get(keyFor(c));
      expect(expected, `missing Perl output for ${keyFor(c)}`).toBeDefined();
      // Trim trailing blank line that the fixture grouping may leave.
      const got = render(buildHarp(c));
      expect(got).toBe(expected!.replace(/\n+$/, ""));
    });
  }
});
