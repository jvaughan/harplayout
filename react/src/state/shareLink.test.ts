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
