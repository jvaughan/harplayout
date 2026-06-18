// Port of HarpLayout::Harmonica::Tuning (Tuning.pm), including the working-tree
// "Will Wilde Minor" entry. label_position defaults to 1.

import { type Interval, type Position } from "./circleOfFifths";

export interface Tuning {
  blow: Interval[];
  draw: Interval[];
  labelPosition?: Position;
}

export const TUNINGS: Record<string, Tuning> = {
  // Richter is the standard/default tuning, so it leads; the rest are alphabetical.
  // Hole               1   2   3   4   5   6   7   8   9   10
  Richter: {
    blow: ["1", "3", "5", "1", "3", "5", "1", "3", "5", "1"],
    draw: ["2", "5", "7", "2", "4", "6", "7", "2", "4", "6"],
  },

  Augmented: {
    blow: ["1", "3", "b6", "1", "3", "b6", "1", "3", "b6", "1"],
    draw: ["b3", "5", "7", "b3", "5", "7", "b3", "5", "7", "b3"],
  },

  Country: {
    blow: ["1", "3", "5", "1", "3", "5", "1", "3", "5", "1"],
    draw: ["2", "5", "7", "2", "b5", "6", "7", "2", "4", "6"],
  },

  Diminished: {
    blow: ["b3", "b5", "6", "1", "b3", "b5", "6", "1", "b3", "b5"],
    draw: ["4",  "b6", "7", "2", "4",  "b6", "7", "2", "4",  "b6"],
  },

  "Easy Thirds (Dale King)": {
    blow: ["1", "3", "5", "1", "3", "5", "1", "3", "5", "1"],
    draw: ["2", "4", "6", "2", "4", "6", "7", "2", "4", "6"],
  },

  "L.O Harmonic Minor": {
    blow: ["1", "b3", "5", "1", "b3", "5", "1", "b3", "5", "1"],
    draw: ["2", "5", "7", "2", "4", "b6", "7", "2", "4", "b6"],
  },

  "L.O Melody Maker (labelled in 2nd pos)": {
    blow: ["1", "3", "6", "1", "3", "5", "1", "3", "5", "1"],
    draw: ["2", "5", "7", "2", "b5", "6", "7", "2", "b5", "6"],
    labelPosition: 2,
  },

  "L.O Natural Minor (labelled in 2nd pos)": {
    blow: ["1", "b3", "5", "1", "b3", "5", "1", "3", "5", "1"],
    draw: ["2", "5", "b7", "2", "4", "6", "b7", "2", "4", "6"],
    labelPosition: 2,
  },

  "Natural Minor (labelled in 1st pos)": {
    blow: ["1", "b3", "5", "1", "b3", "5", "1", "3", "5", "1"],
    draw: ["2", "5", "b7", "2", "4", "6", "b7", "2", "4", "6"],
    labelPosition: 1,
  },

  "Paddy Richter": {
    blow: ["1", "3", "6", "1", "3", "5", "1", "3", "5", "1"],
    draw: ["2", "5", "7", "2", "4", "6", "7", "2", "4", "6"],
  },

  "Paddy Solo (Brendan Power)": {
    blow: ["1", "3", "5", "1", "2", "4", "6", "1", "3", "6"],
    draw: ["2", "5", "7", "2", "4", "6", "7", "2", "4", "6"],
  },

  "Power-Bender (Brendan Power)": {
    blow: ["1", "3", "5", "1", "2", "4", "1", "1", "3", "6"],
    draw: ["2", "5", "7", "2", "3", "5", "7", "2", "5", "1"],
  },

  "Power-Blow (Brendan Power)": {
    blow: ["1", "3", "5", "1", "3", "5", "7", "2", "5", "1"],
    draw: ["2", "5", "7", "2", "4", "6", "6", "1", "3", "6"],
  },

  "Power-Chromatic (Brendan Power)": {
    blow: ["1", "3",  "5", "6", "1", "3",  "5", "6", "1", "3"],
    draw: ["2", "b5", "6", "7", "2", "b5", "6", "7", "2", "b5"],
  },

  "Power-Draw (Brendan Power)": {
    blow: ["1", "3", "5", "1", "3", "5", "6", "1", "3", "6"],
    draw: ["2", "5", "7", "2", "4", "6", "7", "2", "5", "1"],
  },

  "Regular Breath (Brendan Power)": {
    blow: ["1", "3", "5", "1", "3",  "5", "6", "1", "3",  "5"],
    draw: ["2", "5", "7", "2", "b5", "6", "7", "2", "b5", "6"],
  },

  "Seydel Augmented": {
    blow: ["1", "3", "b6", "1", "3", "b6", "1", "3", "b6", "1"],
    draw: ["b3", "5", "7", "b3", "5", "7", "b3", "5", "7", "b3"],
  },

  "Seydel Big Six (blues)": {
    blow: ["1", "3", "5", "1", "3", "5"],
    draw: ["2", "5", "7", "2", "4", "6"],
  },

  "Seydel Big Six (folk)": {
    blow: ["1", "3", "5", "1", "3", "5"],
    draw: ["2", "4", "6", "7", "2", "4"],
  },

  "Seydel Circular": {
    blow: ["1", "3", "5", "b7", "2", "4", "6", "1", "3", "5"],
    draw: ["2", "4", "6", "1", "3", "5", "b7", "2", "4", "6"],
  },

  "Seydel Dorian (labelled in 2nd pos)": {
    blow: ["1", "3", "5", "1", "3", "5", "1", "3", "5", "1"],
    draw: ["2", "5", "b7", "2", "4", "6", "b7", "2", "4", "6"],
    labelPosition: 2,
  },

  "Seydel Melodic Maker": {
    blow: ["1", "3", "6", "1", "3", "5", "1", "3", "5", "1"],
    draw: ["2", "5", "7", "2", "b5", "6", "7", "2", "b5", "6"],
    labelPosition: 1,
  },

  "Solo (10 hole)": {
    blow: ["1", "3", "5", "1", "1", "3", "5", "1", "1", "3"],
    draw: ["2", "4", "6", "7", "2", "4", "6", "7", "2", "4"],
  },

  "Solo (12 hole)": {
    blow: ["1", "3", "5", "1", "1", "3", "5", "1", "1", "3", "5", "1"],
    draw: ["2", "4", "6", "7", "2", "4", "6", "7", "2", "4", "6", "7"],
  },

  "Spiral": {
    blow: ["1", "3", "5", "7", "2", "4", "6", "1", "3", "5"],
    draw: ["2", "4", "6", "1", "3", "5", "7", "2", "4", "6"],
  },

  "Will Wilde": {
    blow: ["1", "3", "5", "1", "3", "3", "5", "1", "3", "6"],
    draw: ["2", "5", "7", "2", "4", "5", "7", "2", "5", "1"],
  },

  "Will Wilde Minor (labelled in 2nd position)": {
    blow: ["1", "b3", "5", "1", "b3", "b3", "5", "1", "b3", "6"],
    draw: ["2", "5", "b7", "2", "4", "5", "b7", "2", "5", "1"],
    labelPosition: 2,
  },
};

// Richter is the standard/default tuning, so it leads; the rest are alphabetical.
export function availableTunings(): string[] {
  const rest = Object.keys(TUNINGS)
    .filter((name) => name !== "Richter")
    .sort();
  return ["Richter", ...rest];
}

export function getTuning(name: string): Tuning {
  const t = TUNINGS[name];
  if (!t) throw new Error(`No such tuning '${name}'`);
  return t;
}

export function labelPosition(name: string): Position {
  return getTuning(name).labelPosition ?? 1;
}

// True if `name` collides with a built-in tuning (case-insensitive, trimmed).
// Used to keep user-named custom tunings from masquerading as registry ones.
export function isRegistryTuningName(name: string): boolean {
  const lower = name.trim().toLowerCase();
  return Object.keys(TUNINGS).some((n) => n.toLowerCase() === lower);
}

// Display label for a custom tuning: a user-given name gets " (custom)" appended
// to flag it as edited; the default "Custom" name already conveys that.
export function customTuningLabel(name: string): string {
  return name === "Custom" ? name : `${name} (custom)`;
}
