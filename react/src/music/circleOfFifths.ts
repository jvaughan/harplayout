// Faithful port of HarpLayout::MusicLogic::CircleOfFifths (CircleOfFifths.pm).

// The 12 harmonica keys and the 12 intervals, as strict unions so typos in
// tunings/tables are caught at compile time and the interval/key records below
// are checked for completeness.
export type Key =
  | "C"
  | "Db"
  | "D"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "G"
  | "Ab"
  | "A"
  | "Bb"
  | "B";

// A harmonica playing position is always one of 1..12 (a step count around the
// circle of fifths). This is the *domain* value used at the API/UI boundaries.
// Note: the circle-of-fifths helpers below take a *signed* step count (they get
// called with negatives, e.g. -steps), so their params stay plain `number`.
export type Position =
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 11
  | 12;

export type Interval =
  | "1"
  | "b2"
  | "2"
  | "b3"
  | "3"
  | "4"
  | "b5"
  | "5"
  | "b6"
  | "6"
  | "b7"
  | "7";

// Each key maps to the next fifth up.
const CO5_NOTES: Record<Key, Key> = {
  C: "G",
  G: "D",
  D: "A",
  A: "E",
  E: "B",
  B: "F#",
  "F#": "Db",
  Db: "Ab",
  Ab: "Eb",
  Eb: "Bb",
  Bb: "F",
  F: "C",
};

// How an interval transforms when moving one position clockwise on the circle.
const CO5_INTERVALS: Record<Interval, Interval> = {
  "1": "4",
  b2: "b5",
  "2": "5",
  b3: "b6",
  "3": "6",
  "4": "b7",
  b5: "7",
  "5": "1",
  b6: "b2",
  "6": "2",
  b7: "b3",
  "7": "3",
};

// Reverse of CO5_NOTES (value -> key), built once. Perl: `my %co5 = reverse %co5_notes`.
// The cast is safe: CO5_NOTES is a complete bijection over the 12 keys.
const CO5_NOTES_REVERSED = Object.fromEntries(
  Object.entries(CO5_NOTES).map(([k, v]) => [v, k]),
) as Record<Key, Key>;

export function co5Intervals(): Record<Interval, Interval> {
  return CO5_INTERVALS;
}

export function co5Notes(): Record<Key, Key> {
  return CO5_NOTES;
}

// note_from_position: key N positions away via the circle of fifths.
// `position` is a signed, ~1-based step count: position 1 means "no move", and
// each step beyond walks one fifth up (positive) or down (negative). So the
// number of moves is |offset| in the direction of its sign, where
//   offset = position - 1 (forward) or position + 1 (backward).
// Note the carried-over Perl asymmetry: position 0 behaves like +1 (one fifth up).
export function noteFromPosition(note: Key, position: number): Key {
  const offset = position > 0 ? position - 1 : position + 1;
  const next = offset >= 0 ? CO5_NOTES : CO5_NOTES_REVERSED;
  for (let i = 0; i < Math.abs(offset); i++) {
    note = next[note];
  }
  return note;
}

// position_from_notes: count positions forward from note1 to note2.
export function positionFromNotes(note1: Key, note2: Key): number {
  let pos = 1;
  while (note1 !== note2) {
    note1 = CO5_NOTES[note1];
    pos++;
  }
  return pos;
}

// interval_from_position: transform an interval forward `position-1` steps.
export function intervalFromPosition(
  interval: Interval,
  position: number,
): Interval {
  let offset = position - 1;
  if (offset >= 0) {
    while (offset-- > 0) {
      interval = CO5_INTERVALS[interval];
    }
    return interval;
  }
  // Perl returns undef when offset < 0; positions are always >= 1 so this is unreachable.
  return interval;
}
