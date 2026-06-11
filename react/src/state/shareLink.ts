import type { Key } from "../music/harmonica";
import { allKeys } from "../music/musicLogic";
import { availableTunings } from "../music/tunings";

/** The core layout config carried by a share link. */
export interface ShareConfig {
  tuning: string;
  harpKey: Key;
  songKey: Key;
  position: number;
}

// Short, stable query-param names. Keep these in sync with parseShareParams.
const PARAM = {
  tuning: "t",
  harpKey: "hk",
  songKey: "sk",
  position: "pos",
} as const;

/**
 * Encode a layout config as a URL search string (e.g. "?t=Richter&hk=C&sk=G&pos=2").
 * `calculate` and the view toggles are deliberately excluded — the three resolved
 * key/position values fully pin the displayed layout on their own.
 */
export function encodeShareParams(config: ShareConfig): string {
  const params = new URLSearchParams();
  params.set(PARAM.tuning, config.tuning);
  params.set(PARAM.harpKey, config.harpKey);
  params.set(PARAM.songKey, config.songKey);
  params.set(PARAM.position, String(config.position));
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
  if (tuning && availableTunings().includes(tuning)) {
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
    if (n >= 1 && n <= 12) out.position = n;
  }

  return out;
}
