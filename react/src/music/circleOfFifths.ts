// Faithful port of HarpLayout::MusicLogic::CircleOfFifths (CircleOfFifths.pm).

export type Key = string;
export type Interval = string;

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
const CO5_NOTES_REVERSED: Record<Key, Key> = Object.fromEntries(
  Object.entries(CO5_NOTES).map(([k, v]) => [v, k]),
);

export function co5Intervals(): Record<Interval, Interval> {
  return CO5_INTERVALS;
}

export function co5Notes(): Record<Key, Key> {
  return CO5_NOTES;
}

// note_from_position: key N positions away via the circle of fifths.
// `position` may be negative (passed as a string like "-3" in Perl; here a number).
export function noteFromPosition(note: Key, position: number): Key {
  let offset = position > 0 ? position - 1 : position + 1;

  if (offset > 0) {
    while (offset-- > 0) {
      note = CO5_NOTES[note];
    }
    return note;
  } else if (offset < 0) {
    while (offset++ < 0) {
      note = CO5_NOTES_REVERSED[note];
    }
    return note;
  } else {
    return note;
  }
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
