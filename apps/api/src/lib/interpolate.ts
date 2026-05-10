import { findNearestPoints, idwInterpolate } from "@antipodal/geo";
import type { GridPoint, DayEntry } from "../types.js";

export function interpolateWeather(
  lat: number,
  lng: number,
  grid: GridPoint[],
  dayData: DayEntry[],
): { temp: number; pressure: number } {
  const coords = grid.map((g) => ({ lat: g.lat, lng: g.lng }));
  const nearest = findNearestPoints(lat, lng, coords, 3);

  const tempPoints = nearest
    .filter((p) => dayData[p.index].t1 !== null)
    .map((p) => ({ value: dayData[p.index].t1 as number, distance: p.distance }));

  const pressurePoints = nearest
    .filter((p) => dayData[p.index].p1 !== null)
    .map((p) => ({ value: dayData[p.index].p1 as number, distance: p.distance }));

  const temp = tempPoints.length > 0 ? idwInterpolate(tempPoints) : 0;
  const pressure = pressurePoints.length > 0 ? idwInterpolate(pressurePoints) : 0;

  return {
    temp: Math.round(temp * 100) / 100,
    pressure: Math.round(pressure * 100) / 100,
  };
}
