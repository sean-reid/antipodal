import type { Env } from "../index.js";
import type { GridPoint, DayEntry, MonthFile } from "../types.js";
import { loadCachedJson } from "../lib/r2cache.js";

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

  const dayData = monthData.days[date];
  if (!dayData) {
    return jsonResponse({ error: "No data for the requested date" }, 404);
  }

  let closestIndex = 0;
  let smallestCombined = Infinity;

  for (let i = 0; i < grid.length; i++) {
    const entry = dayData[i];
    if (entry.t1 === null || entry.p1 === null || entry.t2 === null || entry.p2 === null) continue;

    const tempDelta = Math.abs((entry.t1 as number) - (entry.t2 as number));
    const pressureDelta = Math.abs((entry.p1 as number) - (entry.p2 as number));
    const combined = tempDelta + pressureDelta;

    if (combined < smallestCombined) {
      smallestCombined = combined;
      closestIndex = i;
    }
  }

  const closestGrid = grid[closestIndex];
  const closestEntry = dayData[closestIndex];

  return jsonResponse({
    closest: {
      index: closestIndex,
      lat: closestGrid.lat,
      lng: closestGrid.lng,
      antiLat: closestGrid.antiLat,
      antiLng: closestGrid.antiLng,
      tempDelta: Math.round(((closestEntry.t1 as number) - (closestEntry.t2 as number)) * 100) / 100,
      pressureDelta: Math.round(((closestEntry.p1 as number) - (closestEntry.p2 as number)) * 100) / 100,
    },
  });
}
