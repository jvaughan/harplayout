import type { Interval } from "../music/circleOfFifths";
import type { Key, Position } from "../music/harmonica";
import {
  allKeys,
  mapIntervalToChromIdx,
  VALID_INTERVALS,
} from "../music/musicLogic";
import {
  availableTunings,
  isRegistryTuningName,
  type Tuning,
} from "../music/tunings";

/** The core layout config carried by a share link. */
export interface ShareConfig {
  tuning: string;
  harpKey: Key;
  songKey: Key;
  position: Position;
  // When set, a user-edited tuning whose natural notes travel in the link
  // instead of being looked up by name.
  customTuning?: Tuning;
}

// Short, stable query-param names. Keep these in sync with parseShareParams.
const PARAM = {
  tuning: "t",
  harpKey: "hk",
  songKey: "sk",
  position: "pos",
  customBlow: "cb",
  customDraw: "cd",
  customLabelPos: "clp",
} as const;

// Encode each natural note as a single base-12 digit (its chromatic index 0-11
// -> "0".."9","a","b"), so a tuning's notes are a compact separator-free string
// like "0470470470" — no comma escaping clutters the URL.
function encodeNotes(intervals: Interval[]): string {
  return intervals.map((iv) => mapIntervalToChromIdx(iv).toString(12)).join("");
}

// Decode the base-12 note string back to intervals, returning null if it is
// empty or contains any character outside the 0-b range.
function decodeNotes(raw: string): Interval[] | null {
  if (!raw) return null;
  const out: Interval[] = [];
  for (const ch of raw) {
    const idx = parseInt(ch, 12);
    if (Number.isNaN(idx) || idx < 0 || idx > 11) return null;
    out.push(VALID_INTERVALS[idx]);
  }
  return out;
}

/**
 * Encode a layout config as a URL search string (e.g. "?t=Richter&hk=C&sk=G&pos=2").
 * `calculate` and the view toggles are deliberately excluded — the three resolved
 * key/position values fully pin the displayed layout on their own. A custom tuning
 * adds its natural notes as compact base-12 strings (cb/cd) plus an optional label
 * position (clp).
 */
export function encodeShareParams(config: ShareConfig): string {
  const params = new URLSearchParams();
  params.set(PARAM.tuning, config.tuning);
  params.set(PARAM.harpKey, config.harpKey);
  params.set(PARAM.songKey, config.songKey);
  params.set(PARAM.position, String(config.position));
  if (config.customTuning) {
    params.set(PARAM.customBlow, encodeNotes(config.customTuning.blow));
    params.set(PARAM.customDraw, encodeNotes(config.customTuning.draw));
    if (config.customTuning.labelPosition !== undefined) {
      params.set(PARAM.customLabelPos, String(config.customTuning.labelPosition));
    }
  }
  return `?${params.toString()}`;
}

/**
 * Parse a URL search string into a partial config, validating each field
 * independently against the known domains. Invalid or missing fields are simply
 * omitted, so the caller can merge the result over its own defaults.
 */
export function parseShareParams(search: string): Partial<ShareConfig> {
  const params = new URLSearchParams(search);
  const out: Partial<ShareConfig> = {};

  const tuning = params.get(PARAM.tuning);

  // A custom tuning needs both blow and draw arrays of equal, non-zero length.
  const cb = params.get(PARAM.customBlow);
  const cd = params.get(PARAM.customDraw);
  if (cb && cd) {
    const blow = decodeNotes(cb);
    const draw = decodeNotes(cd);
    if (blow && draw && blow.length === draw.length) {
      const custom: Tuning = { blow, draw };
      const clp = params.get(PARAM.customLabelPos);
      if (clp && /^\d+$/.test(clp)) {
        const n = Number(clp);
        if (n >= 1 && n <= 12) custom.labelPosition = n as Position;
      }
      out.customTuning = custom;
      // Honour a user-given name, but never let a custom tuning borrow a
      // registry name (a forged/stale link) — fall back to "Custom".
      out.tuning = tuning && !isRegistryTuningName(tuning) ? tuning : "Custom";
    }
  }

  // A named registry tuning (only when no valid custom tuning took over).
  if (!out.customTuning && tuning && availableTunings().includes(tuning)) {
    out.tuning = tuning;
  }

  const keys = allKeys();
  const harpKey = params.get(PARAM.harpKey);
  if (harpKey && (keys as string[]).includes(harpKey)) {
    out.harpKey = harpKey as Key;
  }
  const songKey = params.get(PARAM.songKey);
  if (songKey && (keys as string[]).includes(songKey)) {
    out.songKey = songKey as Key;
  }

  const position = params.get(PARAM.position);
  if (position && /^\d+$/.test(position)) {
    const n = Number(position);
    if (n >= 1 && n <= 12) out.position = n as Position;
  }

  return out;
}
