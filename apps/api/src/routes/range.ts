import type { Env } from "../index.js";
import { loadCachedJson } from "../lib/r2cache.js";

interface Summary {
	startDate: string;
	endDate: string;
}

export async function handleRange(request: Request, env: Env): Promise<Response> {
	const summary = await loadCachedJson<Summary>("summary.json", env, request);
	const start = summary?.startDate ?? "1940-01-01";
	const end = summary?.endDate ?? "2024-12-31";
	return new Response(JSON.stringify({ start, end }), {
		headers: { "Content-Type": "application/json" },
	});
}
