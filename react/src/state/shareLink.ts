import type { Key, Position } from "../music/harmonica";
import { allKeys, isInterval } from "../music/musicLogic";
import { availableTunings, type Tuning } from "../music/tunings";

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

/**
 * Encode a layout config as a URL search string (e.g. "?t=Richter&hk=C&sk=G&pos=2").
 * `calculate` and the view toggles are deliberately excluded — the three resolved
 * key/position values fully pin the displayed layout on their own. A custom tuning
 * adds its natural notes as comma-joined interval lists (cb/cd) plus an optional
 * label position (clp).
 */
export function encodeShareParams(config: ShareConfig): string {
  const params = new URLSearchParams();
  params.set(PARAM.tuning, config.tuning);
  params.set(PARAM.harpKey, config.harpKey);
  params.set(PARAM.songKey, config.songKey);
  params.set(PARAM.position, String(config.position));
  if (config.customTuning) {
    params.set(PARAM.customBlow, config.customTuning.blow.join(","));
    params.set(PARAM.customDraw, config.customTuning.draw.join(","));
    if (config.customTuning.labelPosition !== undefined) {
      params.set(PARAM.customLabelPos, String(config.customTuning.labelPosition));
    }
  }
  return `?${params.toString()}`;
}

// Parse a comma-joined interval list, returning null if any token is not a valid
// interval or the list is empty.
function parseIntervalList(raw: string): Tuning["blow"] | null {
  const tokens = raw.split(",");
  if (tokens.length === 0 || tokens.some((t) => !isInterval(t))) return null;
  return tokens.filter(isInterval);
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
    const blow = parseIntervalList(cb);
    const draw = parseIntervalList(cd);
    if (blow && draw && blow.length === draw.length) {
      const custom: Tuning = { blow, draw };
      const clp = params.get(PARAM.customLabelPos);
      if (clp && /^\d+$/.test(clp)) {
        const n = Number(clp);
        if (n >= 1 && n <= 12) custom.labelPosition = n as Position;
      }
      out.customTuning = custom;
      out.tuning = tuning || "Custom";
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
