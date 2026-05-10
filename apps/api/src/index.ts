import { handleRange } from "./routes/range.js";
import { handleScanner } from "./routes/scanner.js";
import { handleWeather } from "./routes/weather.js";

export interface Env {
	DATA_BUCKET: R2Bucket;
}

const corsHeaders: Record<string, string> = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, OPTIONS",
	"Access-Control-Max-Age": "86400",
};

function withCors(response: Response): Response {
	const patched = new Response(response.body, response);
	for (const [key, value] of Object.entries(corsHeaders)) {
		patched.headers.set(key, value);
	}
	return patched;
}

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, { status: 204, headers: corsHeaders });
		}

		const url = new URL(request.url);

		if (request.method !== "GET") {
			return withCors(
				new Response(JSON.stringify({ error: "Method not allowed" }), {
					status: 405,
					headers: { "Content-Type": "application/json" },
				}),
			);
		}

		try {
			let response: Response;

			switch (url.pathname) {
				case "/api/weather":
					response = await handleWeather(request, env);
					break;
				case "/api/scanner":
					response = await handleScanner(request, env);
					break;
				case "/api/range":
					response = await handleRange(request, env);
					break;
				default:
					response = new Response(JSON.stringify({ error: "Not found" }), {
						status: 404,
						headers: { "Content-Type": "application/json" },
					});
			}

			return withCors(response);
		} catch {
			return withCors(
				new Response(JSON.stringify({ error: "Internal server error" }), {
					status: 500,
					headers: { "Content-Type": "application/json" },
				}),
			);
		}
	},
} satisfies ExportedHandler<Env>;
