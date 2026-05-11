import type { Env } from "../index.js";
import { loadCachedJson } from "../lib/r2cache.js";
import type { DayEntry, MonthFile } from "../types.js";

interface Summary {
	startDate: string;
	endDate: string;
}

function hasData(entries: DayEntry[]): boolean {
	return entries.some((e) => e.t1 !== null || e.p1 !== null);
}

function prevMonth(ym: string): string {
	const [y, m] = ym.split("-").map(Number);
	if (m === 1) return `${y - 1}-12`;
	return `${y}-${String(m - 1).padStart(2, "0")}`;
}

async function findLastDateWithData(
	claimedEnd: string,
	env: Env,
	request: Request,
): Promise<string> {
	let monthKey = claimedEnd.substring(0, 7);
	const minMonth = "1940-01";

	for (let attempts = 0; attempts < 6; attempts++) {
		if (monthKey < minMonth) break;

		const monthData = await loadCachedJson<MonthFile>(`months/${monthKey}.json`, env, request);
		if (monthData?.days) {
			const dates = Object.keys(monthData.days).sort().reverse();
			for (const date of dates) {
				if (hasData(monthData.days[date])) return date;
			}
		}
		monthKey = prevMonth(monthKey);
	}

	return claimedEnd;
}

export async function handleRange(request: Request, env: Env): Promise<Response> {
	const summary = await loadCachedJson<Summary>("summary.json", env, request);
	const start = summary?.startDate ?? "1940-01-01";
	const claimedEnd = summary?.endDate ?? "2024-12-31";

	const end = await findLastDateWithData(claimedEnd, env, request);

	return new Response(JSON.stringify({ start, end }), {
		headers: { "Content-Type": "application/json" },
	});
}
