import { describe, it, expect } from "vitest";
import { antipodal } from "../src/antipodal.js";

describe("antipodal", () => {
  it("(0, 0) -> (0, 180)", () => {
    expect(antipodal(0, 0)).toEqual({ lat: 0, lng: 180 });
  });

  it("(45, 90) -> (-45, -90)", () => {
    expect(antipodal(45, 90)).toEqual({ lat: -45, lng: -90 });
  });

  it("Sydney (-33.87, 151.21) -> Atlantic (33.87, -28.79)", () => {
    const result = antipodal(-33.87, 151.21);
    expect(result.lat).toBeCloseTo(33.87);
    expect(result.lng).toBeCloseTo(-28.79);
  });

  it("North pole (90, 0) -> South pole (-90, 180)", () => {
    expect(antipodal(90, 0)).toEqual({ lat: -90, lng: 180 });
  });

  it("date line edge: (0, 179) -> (0, -1)", () => {
    expect(antipodal(0, 179)).toEqual({ lat: 0, lng: -1 });
  });

  it("date line edge: (0, -179) -> (0, 1)", () => {
    expect(antipodal(0, -179)).toEqual({ lat: 0, lng: 1 });
  });
});
