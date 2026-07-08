import { describe, expect, it } from "vitest";
import {
  availableTunings,
  customTuningLabel,
  isRegistryTuningName,
  keyLabel,
  keyLabelLong,
  tonality,
  TUNINGS,
} from "./tunings";

describe("availableTunings", () => {
  it("lists Richter first, then the rest alphabetically", () => {
    const list = availableTunings();

    expect(list[0]).toBe("Richter");

    const rest = list.slice(1);
    expect(rest).toEqual([...rest].sort());
    expect(rest).not.toContain("Richter");
  });

  it("includes every tuning exactly once", () => {
    const list = availableTunings();
    expect([...list].sort()).toEqual(Object.keys(TUNINGS).sort());
    expect(new Set(list).size).toBe(list.length);
  });
});

describe("customTuningLabel", () => {
  it("appends ' (custom)' to a user-given name", () => {
    expect(customTuningLabel("My Tuning")).toBe("My Tuning (custom)");
  });

  it("leaves the default 'Custom' name unsuffixed", () => {
    expect(customTuningLabel("Custom")).toBe("Custom");
  });
});

describe("isRegistryTuningName", () => {
  it("matches built-in names case-insensitively", () => {
    expect(isRegistryTuningName("richter")).toBe(true);
    expect(isRegistryTuningName("  Country  ")).toBe(true);
  });

  it("does not match novel names", () => {
    expect(isRegistryTuningName("My Tuning")).toBe(false);
    expect(isRegistryTuningName("Custom")).toBe(false);
  });
});

describe("tonality", () => {
  const MINOR = [
    "L.O Harmonic Minor",
    "L.O Natural Minor (labelled in 2nd pos)",
    "Natural Minor (labelled in 1st pos)",
    "Seydel Dorian (labelled in 2nd pos)",
    "Will Wilde Minor (labelled in 2nd position)",
  ];

  it("reports minor for exactly the minor tunings, major otherwise", () => {
    for (const name of Object.keys(TUNINGS)) {
      expect(tonality(name)).toBe(MINOR.includes(name) ? "minor" : "major");
    }
  });

  it("defaults an unspecified tuning to major", () => {
    expect(tonality("Richter")).toBe("major");
  });
});

describe("keyLabel", () => {
  it("suffixes minor keys with 'm' and leaves major keys bare", () => {
    expect(keyLabel("C", "minor")).toBe("Cm");
    expect(keyLabel("F#", "minor")).toBe("F#m");
    expect(keyLabel("C", "major")).toBe("C");
    expect(keyLabel("F#", "major")).toBe("F#");
  });
});

describe("keyLabelLong", () => {
  it("spells out minor for prose and leaves major keys bare", () => {
    expect(keyLabelLong("C", "minor")).toBe("C minor");
    expect(keyLabelLong("F#", "minor")).toBe("F# minor");
    expect(keyLabelLong("C", "major")).toBe("C");
  });
});

// Structural guard for hand-authored tunings. Strict Interval typing already
// rejects invalid interval strings at compile time; this catches shape mistakes
// (e.g. mismatched blow/draw lengths) that types can't — important because new
// tunings are NOT covered by the Perl cross-check fixture unless it's regenerated.
describe("tuning shape", () => {
  for (const [name, tuning] of Object.entries(TUNINGS)) {
    it(`${name}: blow and draw have the same non-zero hole count`, () => {
      expect(tuning.blow.length).toBeGreaterThan(0);
      expect(tuning.draw.length).toBe(tuning.blow.length);
    });
  }
});
