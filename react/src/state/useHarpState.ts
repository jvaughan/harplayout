import { useMemo, useState } from "react";
import {
  buildHarp,
  type Calculate,
  type HarpLayout,
  type Key,
} from "../music/harmonica";
import { parseShareParams } from "./shareLink";

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
  harpKey: Key;
  songKey: Key;
  position: number;
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
  // calculators
  setTuning: (t: string) => void;
  songCalc: { harpKey: (v: Key) => void; position: (v: number) => void };
  harpCalc: { songKey: (v: Key) => void; position: (v: number) => void };
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
        harpKey: state.harpKey,
        songKey: state.songKey,
        position: state.position,
        calculate: state.calculate,
      }),
    [state.tuning, state.harpKey, state.songKey, state.position, state.calculate],
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
    setTuning: (t) => update({ tuning: t }),
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
