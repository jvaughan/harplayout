import { useMemo, useState } from "react";
import {
  buildHarp,
  type Calculate,
  type HarpLayout,
  type Key,
  type Position,
} from "../music/harmonica";
import type { Tuning } from "../music/tunings";
import { parseShareParams, type ShareConfig } from "./shareLink";

export interface ViewOptions {
  includeBends: boolean;
  includeOverbends: boolean;
  includeUnnecessaryOverbends: boolean;
  showNotes: boolean;
  showIntervals: boolean;
  showIntervalCategories: boolean;
}

interface HarpState extends ViewOptions {
  tuning: string;
  // Set when the user has edited the natural notes; overrides the named tuning.
  customTuning?: Tuning;
  harpKey: Key;
  songKey: Key;
  position: Position;
  calculate: Calculate;
}

const INITIAL: HarpState = {
  tuning: "Richter",
  harpKey: "C",
  songKey: "C",
  position: 1,
  calculate: "song_key",
  includeBends: true,
  includeOverbends: true,
  includeUnnecessaryOverbends: false,
  showNotes: true,
  showIntervals: true,
  showIntervalCategories: true,
};

export interface UseHarpState {
  harp: HarpLayout;
  view: ViewOptions;
  // The currently active tuning definition (custom edit or named registry entry),
  // and the config a share link should carry.
  customTuning?: Tuning;
  shareConfig: ShareConfig;
  // calculators
  setTuning: (t: string) => void;
  editTuning: (def: Tuning, name?: string) => void;
  songCalc: { harpKey: (v: Key) => void; position: (v: Position) => void };
  harpCalc: { songKey: (v: Key) => void; position: (v: Position) => void };
  posCalc: { harpKey: (v: Key) => void; songKey: (v: Key) => void };
  toggle: (key: keyof ViewOptions) => void;
}

// Build the starting state, overlaying any config carried by a share link in the
// URL over the defaults. The lazy initializer runs once on mount.
function getInitialState(): HarpState {
  if (typeof window === "undefined") return INITIAL; // SSR / tests
  return { ...INITIAL, ...parseShareParams(window.location.search) };
}

export function useHarpState(): UseHarpState {
  const [state, setState] = useState<HarpState>(getInitialState);

  const harp = useMemo(
    () =>
      buildHarp({
        tuning: state.tuning,
        tuningDef: state.customTuning,
        harpKey: state.harpKey,
        songKey: state.songKey,
        position: state.position,
        calculate: state.calculate,
      }),
    [
      state.tuning,
      state.customTuning,
      state.harpKey,
      state.songKey,
      state.position,
      state.calculate,
    ],
  );

  // Apply a patch, rebasing the key/position inputs to the currently resolved
  // values first so that switching calculators stays coherent.
  const update = (patch: Partial<HarpState>) =>
    setState((s) => ({
      ...s,
      harpKey: harp.harpKey,
      songKey: harp.songKey,
      position: harp.position,
      ...patch,
    }));

  return {
    harp,
    view: {
      includeBends: state.includeBends,
      includeOverbends: state.includeOverbends,
      includeUnnecessaryOverbends: state.includeUnnecessaryOverbends,
      showNotes: state.showNotes,
      showIntervals: state.showIntervals,
      showIntervalCategories: state.showIntervalCategories,
    },
    customTuning: state.customTuning,
    shareConfig: {
      tuning: harp.tuning,
      harpKey: harp.harpKey,
      songKey: harp.songKey,
      position: harp.position,
      customTuning: state.customTuning,
    },
    // Selecting a named tuning leaves custom-edit mode.
    setTuning: (t) => update({ tuning: t, customTuning: undefined }),
    // A custom edit keeps the current custom name (or "Custom" when first
    // entering custom mode), unless an explicit new name is supplied.
    editTuning: (def, name) =>
      update({
        tuning: name ?? (state.customTuning ? state.tuning : "Custom"),
        customTuning: def,
      }),
    songCalc: {
      harpKey: (v) => update({ calculate: "song_key", harpKey: v }),
      position: (v) => update({ calculate: "song_key", position: v }),
    },
    harpCalc: {
      songKey: (v) => update({ calculate: "harp_key", songKey: v }),
      position: (v) => update({ calculate: "harp_key", position: v }),
    },
    posCalc: {
      harpKey: (v) => update({ calculate: "position", harpKey: v }),
      songKey: (v) => update({ calculate: "position", songKey: v }),
    },
    toggle: (key) => update({ [key]: !state[key] } as Partial<HarpState>),
  };
}
