import { describe, expect, it } from "vitest";
import {
  availableTunings,
  customTuningLabel,
  isRegistryTuningName,
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
