import { describe, expect, it } from "vitest";
import {
  encodeShareParams,
  parseShareParams,
  type ShareConfig,
} from "./shareLink";

const CONFIG: ShareConfig = {
  tuning: "Richter",
  harpKey: "A",
  songKey: "E",
  position: 2,
};

describe("encodeShareParams", () => {
  it("encodes the core config and nothing else", () => {
    const search = encodeShareParams(CONFIG);
    const params = new URLSearchParams(search);

    expect(params.get("t")).toBe("Richter");
    expect(params.get("hk")).toBe("A");
    expect(params.get("sk")).toBe("E");
    expect(params.get("pos")).toBe("2");
    // calculate and the view toggles are deliberately not encoded.
    expect([...params.keys()].sort()).toEqual(["hk", "pos", "sk", "t"]);
  });
});

describe("parseShareParams", () => {
  it("round-trips a valid config", () => {
    expect(parseShareParams(encodeShareParams(CONFIG))).toEqual(CONFIG);
  });

  it("drops an unknown tuning", () => {
    const out = parseShareParams("?t=Bogus&hk=C&sk=G&pos=1");
    expect(out.tuning).toBeUndefined();
    expect(out.harpKey).toBe("C");
  });

  it("drops an invalid key", () => {
    const out = parseShareParams("?hk=H&sk=C");
    expect(out.harpKey).toBeUndefined();
    expect(out.songKey).toBe("C");
  });

  it("drops out-of-range or non-numeric positions", () => {
    expect(parseShareParams("?pos=99").position).toBeUndefined();
    expect(parseShareParams("?pos=0").position).toBeUndefined();
    expect(parseShareParams("?pos=abc").position).toBeUndefined();
    expect(parseShareParams("?pos=12").position).toBe(12);
  });

  it("returns an empty object for missing params", () => {
    expect(parseShareParams("")).toEqual({});
    expect(parseShareParams("?")).toEqual({});
  });
});

describe("custom tunings", () => {
  const CUSTOM: ShareConfig = {
    tuning: "Custom",
    harpKey: "C",
    songKey: "G",
    position: 2,
    customTuning: {
      blow: ["1", "3", "5", "1"],
      draw: ["2", "5", "7", "2"],
      labelPosition: 2,
    },
  };

  it("round-trips a custom tuning", () => {
    expect(parseShareParams(encodeShareParams(CUSTOM))).toEqual(CUSTOM);
  });

  it("encodes the natural notes as compact base-12 cb/cd plus clp", () => {
    const params = new URLSearchParams(encodeShareParams(CUSTOM));
    // 1->0, 3->4, 5->7, 7->b (chromatic index in base 12); no separators.
    expect(params.get("cb")).toBe("0470");
    expect(params.get("cd")).toBe("27b2");
    expect(params.get("clp")).toBe("2");
    expect(params.get("t")).toBe("Custom");
    // No percent-encoded commas clutter the string.
    expect(encodeShareParams(CUSTOM)).not.toContain("%2C");
  });

  it("omits clp when the custom tuning has no label position", () => {
    const blowDraw = {
      blow: CUSTOM.customTuning!.blow,
      draw: CUSTOM.customTuning!.draw,
    };
    const search = encodeShareParams({ ...CUSTOM, customTuning: blowDraw });
    expect(new URLSearchParams(search).has("clp")).toBe(false);
    const out = parseShareParams(search);
    expect(out.customTuning).toEqual(blowDraw);
  });

  it("rejects an out-of-range note character", () => {
    // 'x' is not a base-12 digit (valid range 0-b).
    const out = parseShareParams("?cb=047x&cd=27b2");
    expect(out.customTuning).toBeUndefined();
    expect(out.tuning).toBeUndefined();
  });

  it("rejects mismatched blow/draw lengths", () => {
    const out = parseShareParams("?cb=047&cd=27b2");
    expect(out.customTuning).toBeUndefined();
  });

  it("rejects empty note strings", () => {
    expect(parseShareParams("?cb=&cd=").customTuning).toBeUndefined();
  });

  it("rejects when only one of cb/cd is present", () => {
    expect(parseShareParams("?cb=047").customTuning).toBeUndefined();
    expect(parseShareParams("?cd=27b").customTuning).toBeUndefined();
  });

  it("ignores an out-of-range label position but keeps the notes", () => {
    const out = parseShareParams("?cb=04&cd=27&clp=99");
    expect(out.customTuning).toEqual({ blow: ["1", "3"], draw: ["2", "5"] });
  });

  it("falls back to a named tuning when no custom params are present", () => {
    const out = parseShareParams("?t=Country&hk=C&sk=G&pos=1");
    expect(out.customTuning).toBeUndefined();
    expect(out.tuning).toBe("Country");
  });

  it("round-trips a user-given custom name", () => {
    const named: ShareConfig = { ...CUSTOM, tuning: "My Tuning" };
    const out = parseShareParams(encodeShareParams(named));
    expect(out.tuning).toBe("My Tuning");
    expect(out.customTuning).toEqual(CUSTOM.customTuning);
  });

  it("relabels a custom tuning that borrows a registry name to 'Custom'", () => {
    // A forged/stale link: custom notes but t=Richter (case-insensitive).
    const out = parseShareParams("?t=richter&cb=0470&cd=27b2");
    expect(out.customTuning).toBeDefined();
    expect(out.tuning).toBe("Custom");
  });
});
