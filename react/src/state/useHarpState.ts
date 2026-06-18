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
  // The selected tuning's name — either a registry name or `customName`.
  tuning: string;
  // The user's edited tuning, kept around even while a registry tuning is
  // selected so it stays available in the dropdown. Active only when
  // `tuning === customName`.
  customTuning?: Tuning;
  customName?: string;
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
  // The stored custom tuning and its name (present whenever one has been created,
  // even if a registry tuning is currently selected), plus the share-link config.
  customTuning?: Tuning;
  customName?: string;
  shareConfig: ShareConfig;
  // calculators
  setTuning: (t: string) => void;
  editTuning: (def: Tuning, name?: string) => void;
  discardCustom: (selectTuning: string) => void;
  songCalc: { harpKey: (v: Key) => void; position: (v: Position) => void };
  harpCalc: { songKey: (v: Key) => void; position: (v: Position) => void };
  posCalc: { harpKey: (v: Key) => void; songKey: (v: Key) => void };
  toggle: (key: keyof ViewOptions) => void;
}

// Build the starting state, overlaying any config carried by a share link in the
// URL over the defaults. The lazy initializer runs once on mount.
function getInitialState(): HarpState {
  if (typeof window === "undefined") return INITIAL; // SSR / tests
  const parsed = parseShareParams(window.location.search);
  const state = { ...INITIAL, ...parsed };
  // A shared custom tuning is named by its `tuning` param; record that name so
  // it counts as the active custom tuning.
  if (parsed.customTuning) state.customName = parsed.tuning;
  return state;
}

export function useHarpState(): UseHarpState {
  const [state, setState] = useState<HarpState>(getInitialState);

  // The custom tuning drives the layout only while it is the selected tuning.
  const customActive =
    state.customTuning !== undefined && state.tuning === state.customName;

  const harp = useMemo(
    () =>
      buildHarp({
        tuning: state.tuning,
        tuningDef: customActive ? state.customTuning : undefined,
        harpKey: state.harpKey,
        songKey: state.songKey,
        position: state.position,
        calculate: state.calculate,
      }),
    [
      state.tuning,
      customActive,
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
    customName: state.customName,
    shareConfig: {
      tuning: harp.tuning,
      harpKey: harp.harpKey,
      songKey: harp.songKey,
      position: harp.position,
      // Only share the custom notes when the custom tuning is the one on screen.
      customTuning: customActive ? state.customTuning : undefined,
    },
    // Selecting a tuning by name just changes the selection; the stored custom
    // tuning is retained so it remains available in the dropdown.
    setTuning: (t) => update({ tuning: t }),
    // A custom edit keeps the current custom name (or "Custom" when first
    // entering custom mode), unless an explicit new name is supplied. The def is
    // stored and selected.
    editTuning: (def, name) => {
      const newName =
        name ?? (customActive ? state.customName! : "Custom");
      update({ tuning: newName, customTuning: def, customName: newName });
    },
    // Drop the custom tuning entirely and select the given (registry) tuning.
    discardCustom: (selectTuning) =>
      update({
        tuning: selectTuning,
        customTuning: undefined,
        customName: undefined,
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
