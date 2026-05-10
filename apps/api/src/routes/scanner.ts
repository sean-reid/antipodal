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

  const points = grid.map((gridPoint, i) => {
    const entry = dayData[i];
    const hasNull =
      entry.t1 === null || entry.p1 === null ||
      entry.t2 === null || entry.p2 === null;

    const tempDelta = hasNull ? 0 : Math.round(((entry.t1 as number) - (entry.t2 as number)) * 100) / 100;
    const pressureDelta = hasNull ? 0 : Math.round(((entry.p1 as number) - (entry.p2 as number)) * 100) / 100;
    const combined = hasNull ? Infinity : Math.abs(tempDelta) + Math.abs(pressureDelta);

    if (combined < smallestCombined) {
      smallestCombined = combined;
      closestIndex = i;
    }

    return {
      lat: gridPoint.lat,
      lng: gridPoint.lng,
      antiLat: gridPoint.antiLat,
      antiLng: gridPoint.antiLng,
      temp: entry.t1,
      pressure: entry.p1,
      antiTemp: entry.t2,
      antiPressure: entry.p2,
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
