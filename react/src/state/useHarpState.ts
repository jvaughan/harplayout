import { useMemo, useState } from "react";
import { buildHarp, type Calculate, type HarpLayout } from "../music/harmonica";

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
  harpKey: string;
  songKey: string;
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
  songCalc: { harpKey: (v: string) => void; position: (v: number) => void };
  harpCalc: { songKey: (v: string) => void; position: (v: number) => void };
  posCalc: { harpKey: (v: string) => void; songKey: (v: string) => void };
  toggle: (key: keyof ViewOptions) => void;
}

export function useHarpState(): UseHarpState {
  const [state, setState] = useState<HarpState>(INITIAL);

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
