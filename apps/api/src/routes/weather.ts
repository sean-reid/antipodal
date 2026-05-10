import { antipodal, findNearestPoints, idwInterpolate } from "@antipodal/geo";
import type { Env } from "../index.js";
import { loadCachedJson } from "../lib/r2cache.js";
import type { DayEntry, GridPoint, MonthFile } from "../types.js";

function jsonResponse(data: unknown, status = 200): Response {
	return new Response(JSON.stringify(data), {
		status,
		headers: { "Content-Type": "application/json" },
	});
}

function interpolateFromNearest(
	lat: number,
	lng: number,
	grid: GridPoint[],
	dayData: DayEntry[],
	tempKey: "t1" | "t2",
	pressureKey: "p1" | "p2",
): { temp: number; pressure: number } {
	const coords = grid.map((g) => ({ lat: g.lat, lng: g.lng }));
	const nearest = findNearestPoints(lat, lng, coords, 3);

	const tempPoints = nearest
		.filter((p) => dayData[p.index][tempKey] !== null)
		.map((p) => ({ value: dayData[p.index][tempKey] as number, distance: p.distance }));

	const pressurePoints = nearest
		.filter((p) => dayData[p.index][pressureKey] !== null)
		.map((p) => ({ value: dayData[p.index][pressureKey] as number, distance: p.distance }));

	const temp = tempPoints.length > 0 ? idwInterpolate(tempPoints) : 0;
	const pressure = pressurePoints.length > 0 ? idwInterpolate(pressurePoints) : 0;

	return {
		temp: Math.round(temp * 100) / 100,
		pressure: Math.round(pressure * 100) / 100,
	};
}

export async function handleWeather(request: Request, env: Env): Promise<Response> {
	const url = new URL(request.url);
	const latStr = url.searchParams.get("lat");
	const lngStr = url.searchParams.get("lng");
	const date = url.searchParams.get("date");

	if (!latStr || !lngStr || !date) {
		return jsonResponse({ error: "Missing required params: lat, lng, date" }, 400);
	}

	const lat = Number.parseFloat(latStr);
	const lng = Number.parseFloat(lngStr);

	if (Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
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

	const dayData = monthData.days[date];
	if (!dayData) {
		return jsonResponse({ error: "No data for the requested date" }, 404);
	}

	const point = interpolateFromNearest(lat, lng, grid, dayData, "t1", "p1");

	const anti = antipodal(lat, lng);
	const antipodePoint = interpolateFromNearest(anti.lat, anti.lng, grid, dayData, "t1", "p1");

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
