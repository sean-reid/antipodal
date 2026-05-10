import { describe, it, expect } from "vitest";
import { interpolateWeather } from "../src/lib/interpolate.js";

const grid = [
  { lat: 0, lng: 0 },
  { lat: 10, lng: 10 },
  { lat: -10, lng: -10 },
  { lat: 20, lng: 20 },
];

const dayData = [
  { temp: 25.0, pressure: 1013.0 },
  { temp: 20.0, pressure: 1010.0 },
  { temp: 30.0, pressure: 1016.0 },
  { temp: 15.0, pressure: 1008.0 },
];

describe("interpolateWeather", () => {
  it("returns exact values when query point matches a grid point", () => {
    const result = interpolateWeather(0, 0, grid, dayData);
    expect(result.temp).toBe(25.0);
    expect(result.pressure).toBe(1013.0);
  });

  it("returns weighted interpolation for a point between grid points", () => {
    const result = interpolateWeather(5, 5, grid, dayData);

    expect(result.temp).toBeGreaterThan(15);
    expect(result.temp).toBeLessThan(30);
    expect(result.pressure).toBeGreaterThan(1008);
    expect(result.pressure).toBeLessThan(1016);
  });

  it("biases toward the nearest grid point", () => {
    const nearOrigin = interpolateWeather(0.1, 0.1, grid, dayData);
    expect(nearOrigin.temp).toBeCloseTo(25.0, 0);
    expect(nearOrigin.pressure).toBeCloseTo(1013.0, 0);
  });

  it("returns numeric values with at most 2 decimal places", () => {
    const result = interpolateWeather(3, 7, grid, dayData);
    const tempDecimals = result.temp.toString().split(".")[1]?.length ?? 0;
    const pressureDecimals = result.pressure.toString().split(".")[1]?.length ?? 0;
    expect(tempDecimals).toBeLessThanOrEqual(2);
    expect(pressureDecimals).toBeLessThanOrEqual(2);
  });
});
