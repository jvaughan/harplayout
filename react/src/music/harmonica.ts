// Port of HarpLayout::Harmonica (Harmonica.pm) + HarpLayout::Harmonica::Table.
// Pure function: given tuning/keys/position and which value to calculate,
// build the full note grid and the display rows.

import {
  intervalFromPosition,
  noteFromPosition,
  positionFromNotes,
  type Key,
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
import { getTuning, labelPosition } from "./tunings";

export type Calculate = "harp_key" | "position" | "song_key";
type Plate = "blow" | "draw";

export interface HarpInput {
  tuning: string;
  harpKey: Key;
  position: number;
  songKey: Key;
  calculate: Calculate;
}

export interface HarpLayout {
  tuning: string;
  harpKey: Key;
  songKey: Key;
  position: number;
  labelPosition: number;
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

class HarpBuilder {
  tuning: string;
  harpKey: Key;
  position: number;
  songKey: Key;
  calculate: Calculate;
  labelPos: number;

  // grid[plate][reedIndex][bendstep] = Note
  grid: Record<Plate, Note[][]> = { blow: [], draw: [] };

  constructor(input: HarpInput) {
    this.tuning = input.tuning;
    this.harpKey = input.harpKey;
    this.position = input.position;
    this.songKey = input.songKey;
    this.calculate = input.calculate;
    this.labelPos = labelPosition(input.tuning);
  }

  build(): HarpLayout {
    this.resolveUnknown();
    this.addNaturalNotes();
    this.addBends();
    this.addOverbends();
    return this.makeLayout();
  }

  // Harmonica.pm:37-56 — resolve the one value implied by the other two.
  private resolveUnknown() {
    switch (this.calculate) {
      case "harp_key": {
        const pos = this.position - this.labelPos + 1;
        this.harpKey = noteFromPosition(this.songKey, -pos);
        break;
      }
      case "position": {
        let pos = positionFromNotes(this.harpKey, this.songKey);
        pos += this.labelPos - 1;
        if (pos > 12) pos -= 12;
        this.position = pos;
        break;
      }
      case "song_key": {
        let pk = noteFromPosition(this.harpKey, this.position);
        pk = noteFromPosition(pk, -this.labelPos);
        this.songKey = pk;
        break;
      }
    }
  }

  private plateIntervals(plate: Plate): string[] {
    const t = getTuning(this.tuning);
    return plate === "blow" ? t.blow : t.draw;
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
    firstPosInterval: string,
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
      note.type = "natural";
      note.description = `${reed} hole ${plate} - natural`;
    } else {
      const natural = this.getNote(plate, reed, 0)!;
      if (intervalLt(note, natural)) {
        note.type = `${plate}bend` as NoteType;
        note.description = `${reed} hole ${plate} - bend step ${bendstep}`;
      } else {
        note.type = (attrs?.unnecessaryOb
          ? `unnecessary_over${plate}`
          : `over${plate}`) as NoteType;
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
