import { describe, expect, it } from "vitest";
import {
  addInterval,
  intervalCmp,
  intervalToNum,
  noteFromKeyInterval,
  numToInterval,
  subtractInterval,
} from "./musicLogic";
import {
  intervalFromPosition,
  noteFromPosition,
  positionFromNotes,
} from "./circleOfFifths";

describe("intervalToNum / numToInterval", () => {
  it("converts flats to .5 numeric strings", () => {
    expect(intervalToNum("b2")).toBe("1.5");
    expect(intervalToNum("b3")).toBe("2.5");
    expect(intervalToNum("b5")).toBe("4.5");
    expect(intervalToNum("b7")).toBe("6.5");
    expect(intervalToNum("5")).toBe("5");
  });

  it("round-trips back to interval strings", () => {
    expect(numToInterval("1.5")).toBe("b2");
    expect(numToInterval("2.5")).toBe("b3");
    expect(numToInterval("4.5")).toBe("b5");
    expect(numToInterval("5")).toBe("5");
  });
});

describe("add/subtract interval (chromatic ring, 1 step = 1 semitone)", () => {
  it("adds semitones with octave wrap", () => {
    expect(addInterval("5", 1)).toBe("b6");
    expect(addInterval("1", 1)).toBe("b2");
    expect(addInterval("7", 1)).toBe("1"); // wraps
    expect(addInterval("b7", 1)).toBe("7");
  });

  it("subtracts semitones with octave wrap", () => {
    expect(subtractInterval("3", 2)).toBe("2");
    expect(subtractInterval("1", 1)).toBe("7"); // wraps backward (Perl neg index)
    expect(subtractInterval("b3", 1)).toBe("2");
  });
});

describe("intervalCmp (windowed gt/lt)", () => {
  it("orders adjacent intervals", () => {
    expect(intervalCmp("gt", "3", "1")).toBe(1);
    expect(intervalCmp("lt", "1", "3")).toBe(1);
    expect(intervalCmp("gt", "1", "1")).toBe(0); // equal
  });
});

describe("noteFromKeyInterval", () => {
  it("looks up notes from key + interval", () => {
    expect(noteFromKeyInterval("C", "1")).toBe("C");
    expect(noteFromKeyInterval("C", "5")).toBe("G");
    expect(noteFromKeyInterval("G", "3")).toBe("B");
    expect(noteFromKeyInterval("G", "b3")).toBe("Bb");
  });
});

describe("circle of fifths", () => {
  it("noteFromPosition walks fifths", () => {
    // offset = position>0 ? position-1 : position+1
    expect(noteFromPosition("C", 1)).toBe("C"); // offset 0
    expect(noteFromPosition("C", 2)).toBe("G"); // offset 1
    expect(noteFromPosition("C", 3)).toBe("D"); // offset 2
    expect(noteFromPosition("C", -1)).toBe("C"); // offset 0
    expect(noteFromPosition("C", -2)).toBe("F"); // offset -1, reversed once
    expect(noteFromPosition("C", -3)).toBe("Bb"); // offset -2
  });

  it("positionFromNotes counts steps", () => {
    expect(positionFromNotes("C", "C")).toBe(1);
    expect(positionFromNotes("C", "G")).toBe(2);
    expect(positionFromNotes("C", "D")).toBe(3);
    expect(positionFromNotes("G", "C")).toBe(12);
  });

  it("intervalFromPosition transforms intervals", () => {
    expect(intervalFromPosition("3", 1)).toBe("3"); // offset 0
    expect(intervalFromPosition("3", 2)).toBe("6"); // 3 -> 6
    expect(intervalFromPosition("5", 2)).toBe("1"); // 5 -> 1
    expect(intervalFromPosition("5", 3)).toBe("4"); // 5 -> 1 -> 4
  });
});
