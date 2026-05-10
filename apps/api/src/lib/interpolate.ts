import { findNearestPoints, idwInterpolate } from "@antipodal/geo";

interface GridPoint {
  lat: number;
  lng: number;
}

interface DayValues {
  temp: number;
  pressure: number;
}

export function interpolateWeather(
  lat: number,
  lng: number,
  grid: GridPoint[],
  dayData: DayValues[],
): { temp: number; pressure: number } {
  const nearest = findNearestPoints(lat, lng, grid, 3);

  const temp = idwInterpolate(
    nearest.map((p) => ({ value: dayData[p.index].temp, distance: p.distance })),
  );

  const pressure = idwInterpolate(
    nearest.map((p) => ({
      value: dayData[p.index].pressure,
      distance: p.distance,
    })),
  );

  return { temp: Math.round(temp * 100) / 100, pressure: Math.round(pressure * 100) / 100 };
}
