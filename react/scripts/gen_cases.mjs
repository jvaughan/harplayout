// Generates the cross-check case matrix. Writes cases.json and prints
// pipe-delimited lines (tuning|harpKey|songKey|position|calculate) to stdout.
import { writeFileSync } from "node:fs";

const TUNINGS = [
  "Richter",
  "Solo (10 hole)",
  "Solo (12 hole)",
  "Seydel Big Six (blues)",
  "Seydel Big Six (folk)",
  "Seydel Circular",
  "Seydel Melodic Maker",
  "Seydel Augmented",
  "Seydel Dorian (labelled in 2nd pos)",
  "Paddy Richter",
  "Country",
  "L.O Melody Maker (labelled in 2nd pos)",
  "L.O Natural Minor (labelled in 2nd pos)",
  "Natural Minor (labelled in 1st pos)",
  "L.O Harmonic Minor",
  "Will Wilde",
  "Will Wilde Minor (labelled in 2nd position)",
];

const KEYS = ["C", "G", "A", "Eb", "F#", "Bb"];
const POSITIONS = [1, 2, 3, 4, 5, 12];

const cases = [];
for (const tuning of TUNINGS) {
  // song_key mode: grid resolved from harpKey + position (songKey input ignored).
  for (const harpKey of KEYS) {
    for (const position of POSITIONS) {
      cases.push({
        tuning,
        harpKey,
        songKey: "C",
        position,
        calculate: "song_key",
      });
    }
  }
  // harp_key mode: resolved from songKey + position (harpKey input ignored).
  for (const songKey of KEYS) {
    for (const position of [1, 2, 3, 5]) {
      cases.push({
        tuning,
        harpKey: "C",
        songKey,
        position,
        calculate: "harp_key",
      });
    }
  }
  // position mode: resolved from harpKey + songKey (position input ignored).
  for (const harpKey of ["C", "A", "F#"]) {
    for (const songKey of KEYS) {
      cases.push({
        tuning,
        harpKey,
        songKey,
        position: 1,
        calculate: "position",
      });
    }
  }
}

writeFileSync(
  new URL("./cases.json", import.meta.url),
  JSON.stringify(cases, null, 0) + "\n",
);

for (const c of cases) {
  process.stdout.write(
    `${c.tuning}|${c.harpKey}|${c.songKey}|${c.position}|${c.calculate}\n`,
  );
}
