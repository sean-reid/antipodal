import type { DailyData } from "./fetch.js";

export interface GridPoint {
	lat: number;
	lng: number;
	antiLat: number;
	antiLng: number;
}

export interface DayEntry {
	t1: number | null;
	p1: number | null;
	t2: number | null;
	p2: number | null;
}

export interface MonthlyData {
	days: Record<string, DayEntry[]>;
}

export function transformToMonthlyFiles(
	grid: GridPoint[],
	rawData: Map<number, DailyData>,
): Map<string, MonthlyData> {
	const monthlyMap = new Map<string, MonthlyData>();
	const n = grid.length;

	const referenceDates = rawData.get(0)?.time;
	if (!referenceDates) {
		throw new Error("No data for grid point 0");
	}

	for (const dateStr of referenceDates) {
		const monthKey = dateStr.slice(0, 7);
		if (!monthlyMap.has(monthKey)) {
			monthlyMap.set(monthKey, { days: {} });
		}
	}

	for (let pointIdx = 0; pointIdx < n; pointIdx++) {
		const pointData = rawData.get(pointIdx);
		const antipodalData = rawData.get(pointIdx + n);

		for (let dayIdx = 0; dayIdx < referenceDates.length; dayIdx++) {
			const dateStr = referenceDates[dayIdx];
			const monthKey = dateStr.slice(0, 7);
			// biome-ignore lint/style/noNonNullAssertion: key was just inserted in the loop above
			const monthly = monthlyMap.get(monthKey)!;

			if (!monthly.days[dateStr]) {
				monthly.days[dateStr] = [];
			}

			if (!pointData || !antipodalData) {
				monthly.days[dateStr].push({ t1: null, p1: null, t2: null, p2: null });
			} else {
				monthly.days[dateStr].push({
					t1: pointData.temperature_2m_mean[dayIdx],
					p1: pointData.pressure_msl_mean[dayIdx],
					t2: antipodalData.temperature_2m_mean[dayIdx],
					p2: antipodalData.pressure_msl_mean[dayIdx],
				});
			}
		}
	}

	return monthlyMap;
}
