import { isArray } from "../../src/lib/misc/TypeCheck";

describe("isArray", () => {
  it("returns true only when apply Array Object", () => {
    expect(isArray(null)).toBeFalsy();
    expect(isArray(void 0)).toBeFalsy();
    expect(isArray(0)).toBeFalsy();
    expect(isArray(1)).toBeFalsy();
    expect(isArray(NaN)).toBeFalsy();
    expect(isArray(function() { })).toBeFalsy();
    expect(isArray(() => { })).toBeFalsy();
    expect(isArray("")).toBeFalsy();
    expect(isArray("non-empty string")).toBeFalsy();
    expect(isArray({})).toBeFalsy();
    expect(isArray([])).toBeTruthy();
  });
});