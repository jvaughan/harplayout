// Faithful port of HarpLayout::MusicLogic (MusicLogic.pm).

import { simplify, transpose } from "@tonaljs/note";
import { co5Intervals, type Interval, type Key } from "./circleOfFifths";

const BOUNDARY = 7;

export type IntervalCategory = "chord" | "blue" | "passing" | "danger";

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

// The 12 intervals in chromatic order — the canonical label set.
export const VALID_INTERVALS: Interval[] = [
  "1",
  "b2",
  "2",
  "b3",
  "3",
  "4",
  "b5",
  "5",
  "b6",
  "6",
  "b7",
  "7",
];

// Internal alias kept for the existing chromatic-ring/lookup code below.
const INTERVALS = VALID_INTERVALS;

// Runtime guard for untrusted strings (e.g. parsed from a share link).
export function isInterval(x: string): x is Interval {
  return (VALID_INTERVALS as string[]).includes(x);
}

// num_to_interval: "2.5" -> "b3", "5" -> "5". Inverse of intervalToNum, as a
// lookup so it returns a strictly-typed Interval (every input comes from the
// intervalToNum value set, e.g. the RING below).
const NUM_TO_INTERVAL: Record<string, Interval> = Object.fromEntries(
  INTERVALS.map((i) => [intervalToNum(i), i]),
);

export function numToInterval(n: string): Interval {
  return NUM_TO_INTERVAL[n];
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

// Each interval label as a tonal interval token. The tritone (b5) is spelled as an
// augmented 4th so it simplifies to a sharp/natural (F#, C#, G#, D#, A#, or a natural)
// rather than a flat — matching the convention players expect on a layout chart.
const INTERVAL_TO_TONAL: Record<Interval, string> = {
  "1": "1P",
  b2: "2m",
  "2": "2M",
  b3: "3m",
  "3": "3M",
  "4": "4P",
  b5: "4A",
  "5": "5P",
  b6: "6m",
  "6": "6M",
  b7: "7m",
  "7": "7M",
};

// key -> 12-semitone chromatic scale (formerly a hand-maintained table; now computed
// from tonal). Cell `chromIdx` holds the spelling for the interval whose chromatic
// index is `chromIdx`. `simplify` collapses double accidentals (Ebb/Fb/Cb...) to
// the plain letter the old table used. Kept in sync with the Perl %scale_notes table.
const SCALE_NOTES: Record<Key, string[]> = Object.fromEntries(
  allKeys().map((key) => {
    const row: string[] = [];
    for (const iv of VALID_INTERVALS) {
      row[INT_TO_CHROM[iv]] = simplify(transpose(key, INTERVAL_TO_TONAL[iv]));
    }
    return [key, row];
  }),
) as Record<Key, string[]>;

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
const RING: string[] = (Object.keys(co5Intervals()) as Interval[])
  .map(intervalToNum)
  .sort();

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

// interval_cmp: windowed circular comparison of two intervals on the ring.
export function intervalCmp(
  op: "gt" | "lt",
  int1: Interval,
  int2: Interval,
): boolean {
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
  if (diff === 0) return false; // equal: neither gt nor lt
  return op === "gt" ? intervalGtDiff(diff) : !intervalGtDiff(diff);
}
