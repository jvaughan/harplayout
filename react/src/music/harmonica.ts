// Port of HarpLayout::Harmonica (Harmonica.pm) + HarpLayout::Harmonica::Table.
// Pure function: given tuning/keys/position and which value to calculate,
// build the full note grid and the display rows.

import {
  intervalFromPosition,
  noteFromPosition,
  positionFromNotes,
  type Interval,
  type Key,
  type Position,
} from "./circleOfFifths";
import {
  categoryFromInterval,
  noteFromKeyInterval,
} from "./musicLogic";
import {
  addSemis,
  intervalEq,
  intervalGt,
  intervalLt,
  subSemis,
  type IntervalBearer,
  type Note,
  type NoteType,
} from "./note";
import { getTuning, labelPosition, type Tuning } from "./tunings";

export type { Key, Position };

export type Calculate = "harp_key" | "position" | "song_key";
type Plate = "blow" | "draw";

export interface HarpInput {
  tuning: string;
  // When set, the natural notes come from this definition instead of the named
  // registry entry (used for user-edited "Custom" tunings). `tuning` is then
  // just the display label.
  tuningDef?: Tuning;
  harpKey: Key;
  position: Position;
  songKey: Key;
  calculate: Calculate;
}

export interface HarpLayout {
  tuning: string;
  harpKey: Key;
  songKey: Key;
  position: Position;
  labelPosition: Position;
  numHoles: number;
  // Display rows, each padded to numHoles (null = empty cell).
  // blowRows are top-to-bottom (highest bend at top, natural at bottom).
  blowRows: (Note | null)[][];
  // drawRows are top-to-bottom (natural at top, deepest bend at bottom).
  drawRows: (Note | null)[][];
  holeNums: number[];
}

const PLATES: Plate[] = ["blow", "draw"];

function oppPlate(plate: Plate): Plate {
  return plate === "blow" ? "draw" : "blow";
}

// Build the NoteType for a reed from its plate and the role it plays. Replaces
// template-literal string assembly + `as NoteType` casts with exhaustive returns.
function noteType(
  plate: Plate,
  role: "natural" | "bend" | "overbend",
  unnecessary = false,
): NoteType {
  if (role === "natural") return "natural";
  if (role === "bend") return plate === "blow" ? "blowbend" : "drawbend";
  if (unnecessary) {
    return plate === "blow" ? "unnecessary_overblow" : "unnecessary_overdraw";
  }
  return plate === "blow" ? "overblow" : "overdraw";
}

class HarpBuilder {
  tuning: string;
  tuningDef: Tuning;
  harpKey: Key;
  position: Position;
  songKey: Key;
  calculate: Calculate;
  labelPos: Position;

  // grid[plate][reedIndex][bendstep] = Note
  grid: Record<Plate, Note[][]> = { blow: [], draw: [] };

  constructor(input: HarpInput) {
    this.tuning = input.tuning;
    // A supplied definition overrides the named registry entry.
    this.tuningDef = input.tuningDef ?? getTuning(input.tuning);
    this.harpKey = input.harpKey;
    this.position = input.position;
    this.songKey = input.songKey;
    this.calculate = input.calculate;
    // With a supplied definition, never fall back to a name lookup (the name may
    // be a placeholder like "Custom"); default an absent label position to 1.
    this.labelPos = input.tuningDef
      ? (input.tuningDef.labelPosition ?? 1)
      : labelPosition(input.tuning);
  }

  build(): HarpLayout {
    this.resolveUnknown();
    this.addNaturalNotes();
    this.addBends();
    this.addOverbends();
    return this.makeLayout();
  }

  // Harmonica.pm:37-56 — resolve the one value implied by the other two.
  //
  // Positions are 1-based circle-of-fifths offsets. `labelPos` is the position a
  // tuning is conventionally labelled in (1 for most; 2 for e.g. natural minor),
  // so we shift by `labelPos - 1` to move between the labelled and absolute
  // position frames before walking the circle.
  private resolveUnknown() {
    switch (this.calculate) {
      case "harp_key": {
        // Walk back from the song key by the absolute position to the harp key.
        const steps = this.position - this.labelPos + 1;
        this.harpKey = noteFromPosition(this.songKey, -steps);
        break;
      }
      case "position": {
        let pos = positionFromNotes(this.harpKey, this.songKey);
        pos += this.labelPos - 1; // into the labelled-position frame
        if (pos > 12) pos -= 12; // wrap around the 12 positions
        // The wrap above pins pos to 1..12; the cast records that for the type.
        this.position = pos as Position;
        break;
      }
      case "song_key": {
        const playedKey = noteFromPosition(this.harpKey, this.position);
        this.songKey = noteFromPosition(playedKey, -this.labelPos);
        break;
      }
    }
  }

  private plateIntervals(plate: Plate): Interval[] {
    return plate === "blow" ? this.tuningDef.blow : this.tuningDef.draw;
  }

  private getNote(plate: Plate, reed: number, bendstep: number): Note | undefined {
    const reedArr = this.grid[plate][reed - 1];
    if (!reedArr) return undefined;
    return reedArr[bendstep];
  }

  private addNaturalNotes() {
    for (const plate of PLATES) {
      let reed = 0;
      for (const interval of this.plateIntervals(plate)) {
        this.setNote(plate, ++reed, 0, interval);
      }
    }
  }

  private addBends() {
    for (const plate of PLATES) {
      const opp = oppPlate(plate);
      const holes = this.grid[plate].length;
      for (let hole = 1; hole <= holes; hole++) {
        const natural = this.getNote(plate, hole, 0)!;
        const oppNatural = this.getNote(opp, hole, 0)!;

        // Add bent notes, each one semitone closer to the opposing natural,
        // stopping one semitone away.
        let closest: IntervalBearer = natural;
        let bendstep = 0;
        while (true) {
          closest = subSemis(closest, 1);
          if (!intervalGt(closest, oppNatural)) break;
          closest = this.setNote(plate, hole, ++bendstep, closest.firstPosInterval);
        }
      }
    }
  }

  private addOverbends() {
    for (const plate of PLATES) {
      const opp = oppPlate(plate);
      const holes = this.grid[plate].length;
      for (let hole = 1; hole <= holes; hole++) {
        const natural = this.getNote(plate, hole, 0)!;
        const oppNatural = this.getNote(opp, hole, 0)!;

        if (!intervalLt(natural, oppNatural)) continue; // can't overbend

        // Overbend is one semitone above the opposing reed's natural note.
        const overbend = addSemis(oppNatural, 1);
        const unnecessaryOb = this.holeHasNote(hole + 1, overbend);
        this.setNote(plate, hole, 1, overbend.firstPosInterval, { unnecessaryOb });
      }
    }
  }

  private holeHasNote(hole: number, target: IntervalBearer): boolean {
    for (const plate of PLATES) {
      let bs = 0;
      let n: Note | undefined;
      while ((n = this.getNote(plate, hole, bs++))) {
        if (intervalEq(target, n)) return true;
      }
    }
    return false;
  }

  private setNote(
    plate: Plate,
    reed: number,
    bendstep: number,
    firstPosInterval: Interval,
    attrs?: { unnecessaryOb?: boolean },
  ): Note {
    const positionInterval = intervalFromPosition(firstPosInterval, this.position);
    const note: Note = {
      firstPosInterval,
      bendstep,
      positionInterval,
      intervalCategory: categoryFromInterval(positionInterval),
      note: noteFromKeyInterval(this.songKey, positionInterval),
      id: `hole${reed}_${plate}_step${bendstep}`,
      description: "",
      type: "natural",
    };

    if (bendstep === 0) {
      note.type = noteType(plate, "natural");
      note.description = `${reed} hole ${plate} - natural`;
    } else {
      const natural = this.getNote(plate, reed, 0)!;
      if (intervalLt(note, natural)) {
        note.type = noteType(plate, "bend");
        note.description = `${reed} hole ${plate} - bend step ${bendstep}`;
      } else {
        note.type = noteType(plate, "overbend", attrs?.unnecessaryOb);
        note.description = `${reed} hole - over${plate}`;
      }
    }

    if (!this.grid[plate][reed - 1]) this.grid[plate][reed - 1] = [];
    this.grid[plate][reed - 1][bendstep] = note;
    return note;
  }

  // Table._makeTable + blowNotes/drawNotes/holeNums.
  private makeLayout(): HarpLayout {
    const numHoles = this.grid.blow.length;

    const tableFor = (plate: Plate): (Note | null)[][] => {
      const rows: (Note | null)[][] = [];
      for (let hole = 1; hole <= this.grid[plate].length; hole++) {
        let bs = 0;
        let n: Note | undefined;
        while ((n = this.getNote(plate, hole, bs))) {
          if (!rows[bs]) rows[bs] = new Array(numHoles).fill(null);
          rows[bs][hole - 1] = n;
          bs++;
        }
      }
      // Ensure no holes in the row array (sparse -> filled with null).
      return rows.map((r) => {
        const filled = new Array(numHoles).fill(null) as (Note | null)[];
        for (let i = 0; i < numHoles; i++) filled[i] = r[i] ?? null;
        return filled;
      });
    };

    const blowTable = tableFor("blow");
    const drawTable = tableFor("draw");

    return {
      tuning: this.tuning,
      harpKey: this.harpKey,
      songKey: this.songKey,
      position: this.position,
      labelPosition: this.labelPos,
      numHoles,
      blowRows: [...blowTable].reverse(), // blowNotes: reversed
      drawRows: drawTable, // drawNotes: as-is
      holeNums: Array.from({ length: numHoles }, (_, i) => i + 1),
    };
  }
}

export function buildHarp(input: HarpInput): HarpLayout {
  return new HarpBuilder(input).build();
}
