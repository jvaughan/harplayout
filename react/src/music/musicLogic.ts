// Faithful port of HarpLayout::MusicLogic (MusicLogic.pm).

import { co5Intervals, type Interval, type Key } from "./circleOfFifths";

const BOUNDARY = 7;

export type IntervalCategory = "chord" | "blue" | "passing" | "danger";

// key -> 12-semitone chromatic scale (MusicLogic.pm:16-27).
const SCALE_NOTES: Record<Key, string[]> = {
  C: ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"],
  Db: ["Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C"],
  D: ["D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#"],
  Eb: ["Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D"],
  E: ["E", "F", "F#", "G", "Ab", "A", "Bb", "B", "C", "C#", "D", "D#"],
  F: ["F", "Gb", "G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E"],
  "F#": ["F#", "G", "G#", "A", "A#", "B", "C", "C#", "D", "D#", "E", "E#"],
  G: ["G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "F#"],
  Ab: ["Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G"],
  A: ["A", "Bb", "B", "C", "C#", "D", "Eb", "E", "F", "F#", "G", "G#"],
  Bb: ["Bb", "B", "C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A"],
  B: ["B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#"],
};

// The 12 harmonica keys in the order the Perl app lists them.
export function allKeys(): Key[] {
  return ["G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "F#"];
}

// interval_to_num: "b3" -> "2.5", "5" -> "5". Returns a numeric string.
export function intervalToNum(s: Interval): string {
  const m = /^b(\d)/.exec(s);
  if (m) {
    const n = Number(m[1]) - 1;
    return `${n}.5`;
  }
  return s;
}

// num_to_interval: "2.5" -> "b3", "5" -> "5". Inverse of intervalToNum.
export function numToInterval(n: string): Interval {
  if (/\.5/.test(n)) {
    const v = Number(n) + 0.5;
    return `b${v}`;
  }
  return n;
}

const INT_TO_CHROM: Record<Interval, number> = {
  "1": 0,
  b2: 1,
  "2": 2,
  b3: 3,
  "3": 4,
  "4": 5,
  b5: 6,
  "5": 7,
  b6: 8,
  "6": 9,
  b7: 10,
  "7": 11,
};

export function mapIntervalToChromIdx(interval: Interval): number {
  return INT_TO_CHROM[interval];
}

export function noteFromKeyInterval(key: Key, interval: Interval): string {
  return SCALE_NOTES[key][mapIntervalToChromIdx(interval)];
}

const INT_TO_CAT: Record<Interval, IntervalCategory> = {
  "1": "chord",
  b2: "danger",
  "2": "passing",
  b3: "blue",
  "3": "chord",
  "4": "passing",
  b5: "blue",
  "5": "chord",
  b6: "danger",
  "6": "passing",
  b7: "blue",
  "7": "danger",
};

export function categoryFromInterval(interval: Interval): IntervalCategory {
  return INT_TO_CAT[interval];
}

// The 12-element chromatic ring: keys of co5_intervals mapped to numeric strings,
// then string-sorted (matching Perl's default `sort`). JS Array.sort defaults to
// the same lexicographic string ordering, and for these values it equals numeric order.
const RING: string[] = Object.keys(co5Intervals()).map(intervalToNum).sort();

function sortedNumericIntervals(): string[] {
  return RING;
}

function addSubtractInterval(
  op: "add" | "sub",
  orig: Interval,
  amt: number,
): Interval {
  const origNum = intervalToNum(orig);

  while (amt > 12) {
    amt -= 12;
  }

  const intervals = sortedNumericIntervals();
  let origLoc = 0;
  intervals.forEach((v, i) => {
    if (Number(v) === Number(origNum)) origLoc = i;
  });

  let newLoc = op === "add" ? origLoc + amt : origLoc - amt;
  if (newLoc > 11) newLoc -= 12;
  // Perl uses negative array indexing ($intervals[-1] -> last element); replicate
  // that wrap-around for the subtract case.
  if (newLoc < 0) newLoc += 12;

  return numToInterval(intervals[newLoc]);
}

export function addInterval(orig: Interval, amt: number): Interval {
  return addSubtractInterval("add", orig, amt);
}

export function subtractInterval(orig: Interval, amt: number): Interval {
  return addSubtractInterval("sub", orig, amt);
}

// interval_gt: the windowed comparison on the position difference (MusicLogic.pm:69-81).
function intervalGtDiff(diff: number): boolean {
  if (diff < 0 - BOUNDARY + 2) {
    return true;
  } else if (diff > 0 && diff < BOUNDARY) {
    return true;
  }
  return false;
}

// interval_cmp: returns 1/0 like the Perl (used as a boolean by callers).
export function intervalCmp(
  op: "gt" | "lt",
  int1: Interval,
  int2: Interval,
): 0 | 1 {
  const n1 = intervalToNum(int1);
  const n2 = intervalToNum(int2);

  const intervals = sortedNumericIntervals();
  let loc1 = 0;
  let loc2 = 0;
  intervals.forEach((v, i) => {
    if (v === n1) loc1 = i;
    if (v === n2) loc2 = i;
  });

  const diff = loc1 - loc2;
  if (diff === 0) return 0; // Equal

  if (op === "gt") {
    return intervalGtDiff(diff) ? 1 : 0;
  }
  // op === "lt"
  return intervalGtDiff(diff) ? 0 : 1;
}
