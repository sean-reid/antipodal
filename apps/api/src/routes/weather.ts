import { antipodal } from "@antipodal/geo";
import type { Env } from "../index.js";
import { interpolateWeather } from "../lib/interpolate.js";
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

export async function handleWeather(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const latStr = url.searchParams.get("lat");
  const lngStr = url.searchParams.get("lng");
  const date = url.searchParams.get("date");

  if (!latStr || !lngStr || !date) {
    return jsonResponse({ error: "Missing required params: lat, lng, date" }, 400);
  }

  const lat = parseFloat(latStr);
  const lng = parseFloat(lngStr);

  if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return jsonResponse({ error: "Invalid lat/lng values" }, 400);
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

  const point = interpolateWeather(lat, lng, grid, dayEntry.values);

  const anti = antipodal(lat, lng);
  const antipodePoint = interpolateWeather(anti.lat, anti.lng, grid, dayEntry.values);

  return jsonResponse({
    point: { lat, lng, temp: point.temp, pressure: point.pressure },
    antipode: {
      lat: anti.lat,
      lng: anti.lng,
      temp: antipodePoint.temp,
      pressure: antipodePoint.pressure,
    },
    delta: {
      temp: Math.round((point.temp - antipodePoint.temp) * 100) / 100,
      pressure: Math.round((point.pressure - antipodePoint.pressure) * 100) / 100,
    },
  });
}
