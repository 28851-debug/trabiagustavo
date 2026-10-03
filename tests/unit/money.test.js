import { describe, expect, it } from "vitest";
import { parseMoneyCents } from "../../backend/src/utils/money.js";

describe("parseMoneyCents", () => {
  it("accepts safe non-negative integer cents", () => expect(parseMoneyCents(4990)).toBe(4990));
  it.each([-1, 1.5, Number.MAX_SAFE_INTEGER + 1, "20.00"])("rejects unsafe cents %s", (value) => expect(() => parseMoneyCents(value)).toThrow());
});
