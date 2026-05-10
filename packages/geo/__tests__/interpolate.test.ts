import { describe, it, expect } from "vitest";
import { idwInterpolate } from "../src/interpolate.js";

describe("idwInterpolate", () => {
  it("returns the value at distance 0 (exact match)", () => {
    const result = idwInterpolate([
      { value: 42, distance: 0 },
      { value: 100, distance: 10 },
    ]);
    expect(result).toBe(42);
  });

  it("returns average when all distances are equal", () => {
    const result = idwInterpolate([
      { value: 10, distance: 5 },
      { value: 20, distance: 5 },
      { value: 30, distance: 5 },
    ]);
    expect(result).toBeCloseTo(20);
  });

  it("gives more weight to closer points", () => {
    const result = idwInterpolate([
      { value: 10, distance: 1 },
      { value: 50, distance: 10 },
    ]);
    // The close point (value=10) should dominate
    expect(result).toBeGreaterThan(10);
    expect(result).toBeLessThan(20);
  });

  it("power parameter affects weighting", () => {
    const values = [
      { value: 10, distance: 1 },
      { value: 50, distance: 10 },
    ];
    const lowPower = idwInterpolate(values, 1);
    const highPower = idwInterpolate(values, 4);
    // Higher power makes close points even more dominant, pulling result closer to 10
    expect(highPower).toBeLessThan(lowPower);
  });
});
