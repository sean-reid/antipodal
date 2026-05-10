import type { Env } from "../index.js";

export async function loadCachedJson<T>(
	key: string,
	env: Env,
	request: Request,
): Promise<T | null> {
	const cacheKey = new Request(new URL(key, request.url).toString());
	const cache = caches.default;

	const cached = await cache.match(cacheKey);
	if (cached) {
		return cached.json<T>();
	}

	const obj = await env.DATA_BUCKET.get(key);
	if (!obj) {
		return null;
	}

	const body = await obj.text();
	const response = new Response(body, {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=3600",
		},
	});

	await cache.put(cacheKey, response.clone());

	return response.json<T>();
}
