import { describe, it, expect } from "vitest";
import { fibonacciSphere, findNearestPoints } from "../src/grid.js";
import { haversine } from "../src/distance.js";

describe("fibonacciSphere", () => {
  it("returns exactly n points", () => {
    const points = fibonacciSphere(100);
    expect(points).toHaveLength(100);
  });

  it("all points have valid lat/lng ranges", () => {
    const points = fibonacciSphere(100);
    for (const p of points) {
      expect(p.lat).toBeGreaterThanOrEqual(-90);
      expect(p.lat).toBeLessThanOrEqual(90);
      expect(p.lng).toBeGreaterThanOrEqual(-180);
      expect(p.lng).toBeLessThanOrEqual(180);
    }
  });

  it("points are reasonably distributed", () => {
    const points = fibonacciSphere(100);
    let minDistance = Infinity;
    for (let i = 0; i < points.length; i++) {
      for (let j = i + 1; j < points.length; j++) {
        const d = haversine(points[i].lat, points[i].lng, points[j].lat, points[j].lng);
        if (d < minDistance) {
          minDistance = d;
        }
      }
    }
    // For 100 points on a sphere, no two should be closer than ~500 km
    expect(minDistance).toBeGreaterThan(500);
  });
});

describe("findNearestPoints", () => {
  it("returns k results sorted by distance", () => {
    const grid = fibonacciSphere(100);
    const nearest = findNearestPoints(0, 0, grid, 5);
    expect(nearest).toHaveLength(5);
    for (let i = 1; i < nearest.length; i++) {
      expect(nearest[i].distance).toBeGreaterThanOrEqual(nearest[i - 1].distance);
    }
  });
});
