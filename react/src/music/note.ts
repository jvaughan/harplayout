// Port of HarpLayout::Harmonica::Note (Note.pm).
// The Perl operator overloads (+ - == < >) all key off first_pos_interval only,
// so these helpers do the same. A Note here is a plain data object.

import { type Interval, type Key } from "./circleOfFifths";
import {
  addInterval,
  intervalCmp,
  subtractInterval,
  type IntervalCategory,
} from "./musicLogic";

export type NoteType =
  | "natural"
  | "blowbend"
  | "drawbend"
  | "overblow"
  | "overdraw"
  | "unnecessary_overblow"
  | "unnecessary_overdraw";

export interface Note {
  firstPosInterval: Interval;
  positionInterval: Interval;
  intervalCategory: IntervalCategory;
  note: string; // actual pitch name, e.g. "Eb"
  bendstep: number;
  description: string;
  type: NoteType;
  id: string;
}

// The Perl `+` / `-` overloads return a *new* note carrying only first_pos_interval.
// We mirror that with a lightweight interval-bearing value.
export interface IntervalBearer {
  firstPosInterval: Interval;
}

export function addSemis(n: IntervalBearer, amt: number): IntervalBearer {
  return { firstPosInterval: addInterval(n.firstPosInterval, amt) };
}

export function subSemis(n: IntervalBearer, amt: number): IntervalBearer {
  return { firstPosInterval: subtractInterval(n.firstPosInterval, amt) };
}

// `==` overload: string equality on first_pos_interval.
export function intervalEq(a: IntervalBearer, b: IntervalBearer): boolean {
  return a.firstPosInterval === b.firstPosInterval;
}

// `>` overload.
export function intervalGt(a: IntervalBearer, b: IntervalBearer): boolean {
  return intervalCmp("gt", a.firstPosInterval, b.firstPosInterval);
}

// `<` overload.
export function intervalLt(a: IntervalBearer, b: IntervalBearer): boolean {
  return intervalCmp("lt", a.firstPosInterval, b.firstPosInterval);
}

export type { Interval, Key };
