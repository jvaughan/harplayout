// Regenerates the static SCALE_NOTES table in src/music/musicLogic.ts.
//
// The table maps each harp key -> its 12-semitone chromatic scale, spelled to match
// the convention players expect on a layout chart (the tritone at chromIdx 6 spelled
// as an augmented 4th). It's precomputed here from @tonaljs/note so the shipped bundle
// doesn't carry the tonal dependency at runtime.
//
// Run from react/:  node scripts/gen_scale_notes.mjs
// Then paste the printed object literal into SCALE_NOTES in src/music/musicLogic.ts.

import { simplify, transpose } from "@tonaljs/note";

const KEYS = ["G", "Ab", "A", "Bb", "B", "C", "Db", "D", "Eb", "E", "F", "F#"];
const VALID = ["1", "b2", "2", "b3", "3", "4", "b5", "5", "b6", "6", "b7", "7"];
const INT_TO_CHROM = { "1": 0, b2: 1, "2": 2, b3: 3, "3": 4, "4": 5, b5: 6, "5": 7, b6: 8, "6": 9, b7: 10, "7": 11 };
// b5 spelled as augmented 4th so it simplifies to a sharp/natural rather than a flat.
const TONAL = { "1": "1P", b2: "2m", "2": "2M", b3: "3m", "3": "3M", "4": "4P", b5: "4A", "5": "5P", b6: "6m", "6": "6M", b7: "7m", "7": "7M" };

for (const key of KEYS) {
  const row = [];
  for (const iv of VALID) row[INT_TO_CHROM[iv]] = simplify(transpose(key, TONAL[iv]));
  const label = /^[A-G]$/.test(key) ? key : JSON.stringify(key);
  console.log(`  ${label}: ${JSON.stringify(row)},`);
}
