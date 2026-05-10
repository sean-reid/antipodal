import { describe, it, expect } from "vitest";
import { interpolateWeather } from "../src/lib/interpolate.js";

const grid = [
  { lat: 0, lng: 0, antiLat: 0, antiLng: 180 },
  { lat: 10, lng: 10, antiLat: -10, antiLng: -170 },
  { lat: -10, lng: -10, antiLat: 10, antiLng: 170 },
  { lat: 20, lng: 20, antiLat: -20, antiLng: -160 },
];

const dayData = [
  { t1: 25.0, p1: 1013.0, t2: 18.0, p2: 1010.0 },
  { t1: 20.0, p1: 1010.0, t2: 22.0, p2: 1012.0 },
  { t1: 30.0, p1: 1016.0, t2: 15.0, p2: 1008.0 },
  { t1: 15.0, p1: 1008.0, t2: 28.0, p2: 1015.0 },
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

  it("handles null values by skipping them", () => {
    const dataWithNulls = [
      { t1: null, p1: null, t2: 18.0, p2: 1010.0 },
      { t1: 20.0, p1: 1010.0, t2: 22.0, p2: 1012.0 },
      { t1: 30.0, p1: 1016.0, t2: 15.0, p2: 1008.0 },
      { t1: 15.0, p1: 1008.0, t2: 28.0, p2: 1015.0 },
    ];

    const result = interpolateWeather(0, 0, grid, dataWithNulls);
    expect(typeof result.temp).toBe("number");
    expect(typeof result.pressure).toBe("number");
    expect(isNaN(result.temp)).toBe(false);
    expect(isNaN(result.pressure)).toBe(false);
  });
});
