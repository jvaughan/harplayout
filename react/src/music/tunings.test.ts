import { describe, expect, it } from "vitest";
import { availableTunings, TUNINGS } from "./tunings";

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
