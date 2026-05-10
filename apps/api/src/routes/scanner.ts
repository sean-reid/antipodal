import { antipodal } from "@antipodal/geo";
import type { Env } from "../index.js";
import { loadCachedJson } from "../lib/r2cache.js";

interface GridPoint {
  lat: number;
  lng: number;
}

interface DayEntry {
  date: string;
  values: Array<{ temp: number; pressure: number }>;
}

interface MonthFile {
  days: DayEntry[];
}

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function handleScanner(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const date = url.searchParams.get("date");

  if (!date) {
    return jsonResponse({ error: "Missing required param: date" }, 400);
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return jsonResponse({ error: "Invalid date format, expected YYYY-MM-DD" }, 400);
  }

  const monthKey = date.substring(0, 7);

  const [grid, monthData] = await Promise.all([
    loadCachedJson<GridPoint[]>("grid.json", env, request),
    loadCachedJson<MonthFile>(`months/${monthKey}.json`, env, request),
  ]);

  if (!grid) {
    return jsonResponse({ error: "Grid data not available" }, 500);
  }

  if (!monthData) {
    return jsonResponse({ error: "No data for the requested month" }, 404);
  }

  const dayEntry = monthData.days.find((d) => d.date === date);
  if (!dayEntry) {
    return jsonResponse({ error: "No data for the requested date" }, 404);
  }

  let closestIndex = 0;
  let smallestCombined = Infinity;

  const points = grid.map((gridPoint, i) => {
    const anti = antipodal(gridPoint.lat, gridPoint.lng);
    const val = dayEntry.values[i];

    // Find the antipodal grid point's value by looking up the nearest grid point
    // to the antipodal coordinates. Since the grid is a fibonacci sphere, antipodal
    // points map back onto other grid points.
    const antiIndex = findAntipodalIndex(grid, anti.lat, anti.lng);
    const antiVal = dayEntry.values[antiIndex];

    const tempDelta = Math.round((val.temp - antiVal.temp) * 100) / 100;
    const pressureDelta = Math.round((val.pressure - antiVal.pressure) * 100) / 100;
    const combined = Math.abs(tempDelta) + Math.abs(pressureDelta);

    if (combined < smallestCombined) {
      smallestCombined = combined;
      closestIndex = i;
    }

    return {
      lat: gridPoint.lat,
      lng: gridPoint.lng,
      antiLat: anti.lat,
      antiLng: anti.lng,
      temp: val.temp,
      pressure: val.pressure,
      antiTemp: antiVal.temp,
      antiPressure: antiVal.pressure,
      tempDelta,
      pressureDelta,
    };
  });

  const closest = points[closestIndex];

  return jsonResponse({
    points,
    closest: {
      index: closestIndex,
      lat: closest.lat,
      lng: closest.lng,
      antiLat: closest.antiLat,
      antiLng: closest.antiLng,
      tempDelta: closest.tempDelta,
      pressureDelta: closest.pressureDelta,
    },
  });
}

function findAntipodalIndex(
  grid: GridPoint[],
  antiLat: number,
  antiLng: number,
): number {
  let bestIndex = 0;
  let bestDist = Infinity;

  for (let i = 0; i < grid.length; i++) {
    const dLat = grid[i].lat - antiLat;
    const dLng = grid[i].lng - antiLng;
    const dist = dLat * dLat + dLng * dLng;
    if (dist < bestDist) {
      bestDist = dist;
      bestIndex = i;
    }
  }

  return bestIndex;
}
