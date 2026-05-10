import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";

const DEFAULT_BASE_URL = "https://archive-api.open-meteo.com";

const REMOTE_BATCH_SIZE = 10;
const LOCAL_BATCH_SIZE = 50;
const LOCAL_CONCURRENCY = 8;

const REMOTE_DELAY_MS = 6_000;

const REMOTE_BUDGET = 5_000;

const DELAY_AFTER_MINUTELY_LIMIT_MS = 90_000;
const CHECKPOINT_INTERVAL = 5;

export interface FetchOptions {
	resume?: boolean;
	startDate?: string;
	endDate?: string;
	baseUrl?: string;
}

export interface DailyData {
	time: string[];
	temperature_2m_mean: (number | null)[];
	pressure_msl_mean: (number | null)[];
}

interface Checkpoint {
	lastCompletedBatch: number;
	data: Record<string, DailyData>;
	requestCount: number;
}

const OUTPUT_DIR = join(process.cwd(), "output");
const CHECKPOINT_PATH = join(OUTPUT_DIR, "checkpoint.json");

function isLocal(baseUrl: string): boolean {
	return baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
}

function sleep(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms));
}

class DailyLimitError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "DailyLimitError";
	}
}

class BudgetExhaustedError extends Error {
	constructor(used: number, budget: number) {
		super(
			`Request budget exhausted: ${used}/${budget} used. Resume later with --resume to continue.`,
		);
		this.name = "BudgetExhaustedError";
	}
}

async function healthCheck(archiveUrl: string): Promise<void> {
	console.log("Health check: verifying API availability...");
	const url = `${archiveUrl}?latitude=0&longitude=0&start_date=2020-01-01&end_date=2020-01-02&daily=temperature_2m_mean&models=era5&timezone=UTC`;
	const res = await fetch(url);
	if (!res.ok) {
		const body = await res.text().catch(() => "");
		if (body.includes("Daily API request limit exceeded")) {
			throw new DailyLimitError(
				"Daily API limit already exhausted. Wait for reset (midnight UTC) and try again.",
			);
		}
		throw new Error(`Health check failed: HTTP ${res.status} - ${body.slice(0, 300)}`);
	}
	const json = await res.json();
	if (json.error) {
		throw new Error(`Health check failed: ${json.reason || JSON.stringify(json)}`);
	}
	console.log("Health check passed. API is available.\n");
}

function buildBatchUrl(
	archiveUrl: string,
	locations: Array<{ lat: number; lng: number }>,
	startDate: string,
	endDate: string,
): string {
	const lats = locations.map((l) => l.lat.toFixed(4)).join(",");
	const lngs = locations.map((l) => l.lng.toFixed(4)).join(",");
	return `${archiveUrl}?latitude=${lats}&longitude=${lngs}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,pressure_msl_mean&models=era5&timezone=UTC`;
}

function parseErrorCategory(body: string): "daily" | "minutely" | "hourly" | "unknown" {
	const lower = body.toLowerCase();
	if (lower.includes("daily api request limit") || lower.includes("daily")) return "daily";
	if (lower.includes("minutely") || lower.includes("per minute")) return "minutely";
	if (lower.includes("hourly") || lower.includes("per hour")) return "hourly";
	return "unknown";
}

async function fetchBatch(
	archiveUrl: string,
	locations: Array<{ lat: number; lng: number }>,
	startDate: string,
	endDate: string,
): Promise<DailyData[]> {
	const url = buildBatchUrl(archiveUrl, locations, startDate, endDate);
	const res = await fetch(url);

	if (!res.ok) {
		const body = await res.text().catch(() => "");
		const category = parseErrorCategory(body);

		if (res.status === 429 || category === "daily") {
			if (category === "daily") {
				throw new DailyLimitError(
					`Daily API limit hit. ${body.slice(0, 200)}\nSave checkpoint and abort. Resume later with --resume.`,
				);
			}
			if (category === "minutely" || category === "hourly") {
				console.log(
					`\nRate limited (${category}). Pausing ${DELAY_AFTER_MINUTELY_LIMIT_MS / 1000}s before retry...`,
				);
				await sleep(DELAY_AFTER_MINUTELY_LIMIT_MS);
				const retry = await fetch(url);
				if (!retry.ok) {
					const retryBody = await retry.text().catch(() => "");
					if (parseErrorCategory(retryBody) === "daily") {
						throw new DailyLimitError(`Daily limit hit on retry. ${retryBody.slice(0, 200)}`);
					}
					throw new Error(
						`Failed after rate-limit retry: HTTP ${retry.status} - ${retryBody.slice(0, 200)}`,
					);
				}
				const retryJson = await retry.json();
				return normalizeBatchResponse(retryJson, locations.length);
			}
			throw new DailyLimitError(
				`Rate limited (unknown category). Aborting to be safe. ${body.slice(0, 200)}`,
			);
		}

		if (res.status >= 500) {
			console.log(`\nServer error (HTTP ${res.status}). Pausing 30s before retry...`);
			await sleep(30_000);
			const retry = await fetch(url);
			if (!retry.ok) {
				throw new Error(
					`Server error persists: HTTP ${retry.status} - ${await retry.text().catch(() => "")}`,
				);
			}
			const retryJson = await retry.json();
			return normalizeBatchResponse(retryJson, locations.length);
		}

		throw new Error(`HTTP ${res.status}: ${body.slice(0, 300)}`);
	}

	const json = await res.json();
	if (json.error) {
		const reason = json.reason || "";
		if (reason.toLowerCase().includes("daily")) {
			throw new DailyLimitError(reason);
		}
		throw new Error(`API error: ${reason}`);
	}

	return normalizeBatchResponse(json, locations.length);
}

// biome-ignore lint/suspicious/noExplicitAny: untyped API response
function normalizeBatchResponse(json: any, expectedCount: number): DailyData[] {
	if (Array.isArray(json)) {
		// biome-ignore lint/suspicious/noExplicitAny: untyped API response items
		return json.map((item: any) => item.daily as DailyData);
	}
	if (json.daily) {
		return [json.daily as DailyData];
	}
	throw new Error(
		`Unexpected response shape (expected ${expectedCount} results): ${JSON.stringify(json).slice(0, 500)}`,
	);
}

async function saveCheckpoint(
	lastCompletedBatch: number,
	data: Map<number, DailyData>,
	requestCount: number,
): Promise<void> {
	await mkdir(OUTPUT_DIR, { recursive: true });
	const serializable: Checkpoint = {
		lastCompletedBatch,
		data: Object.fromEntries(data),
		requestCount,
	};
	await writeFile(CHECKPOINT_PATH, JSON.stringify(serializable));
}

async function loadCheckpoint(): Promise<{
	lastCompletedBatch: number;
	data: Map<number, DailyData>;
	requestCount: number;
} | null> {
	try {
		const raw = await readFile(CHECKPOINT_PATH, "utf-8");
		const parsed: Checkpoint = JSON.parse(raw);
		return {
			lastCompletedBatch: parsed.lastCompletedBatch,
			data: new Map(Object.entries(parsed.data).map(([k, v]) => [Number(k), v])),
			requestCount: parsed.requestCount || 0,
		};
	} catch {
		return null;
	}
}

function formatEta(remainingBatches: number, msPerBatch: number): string {
	const totalMs = remainingBatches * msPerBatch;
	const minutes = Math.ceil(totalMs / 60_000);
	if (minutes < 60) return `${minutes}m`;
	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;
	return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
}

export async function fetchAllWeather(
	locations: Array<{ lat: number; lng: number }>,
	options: FetchOptions = {},
): Promise<Map<number, DailyData>> {
	const {
		resume: resumeFrom,
		startDate = "1940-01-01",
		endDate = "2024-12-31",
		baseUrl = DEFAULT_BASE_URL,
	} = options;

	const local = isLocal(baseUrl);
	const archiveUrl = `${baseUrl}/v1/archive`;
	const batchSize = local ? LOCAL_BATCH_SIZE : REMOTE_BATCH_SIZE;

	console.log(`Mode: ${local ? "local (no rate limits)" : "remote (rate-limited)"}`);
	console.log(`API: ${baseUrl}`);

	await healthCheck(archiveUrl);

	const batches: Array<{ indices: number[]; locs: Array<{ lat: number; lng: number }> }> = [];
	for (let i = 0; i < locations.length; i += batchSize) {
		const end = Math.min(i + batchSize, locations.length);
		const indices = Array.from({ length: end - i }, (_, k) => i + k);
		const locs = indices.map((idx) => locations[idx]);
		batches.push({ indices, locs });
	}

	if (local) {
		return fetchLocal(archiveUrl, batches, locations.length, startDate, endDate);
	}
	return fetchRemote(archiveUrl, batches, locations.length, startDate, endDate, resumeFrom);
}

type Batch = { indices: number[]; locs: Array<{ lat: number; lng: number }> };

async function fetchLocal(
	archiveUrl: string,
	batches: Batch[],
	totalLocations: number,
	startDate: string,
	endDate: string,
): Promise<Map<number, DailyData>> {
	const data = new Map<number, DailyData>();
	const total = batches.length;
	let completed = 0;
	const startTime = Date.now();

	console.log(
		`${totalLocations} locations in ${total} batches of ${LOCAL_BATCH_SIZE}, ${LOCAL_CONCURRENCY} concurrent\n`,
	);

	for (let i = 0; i < total; i += LOCAL_CONCURRENCY) {
		const chunk = batches.slice(i, i + LOCAL_CONCURRENCY);
		const results = await Promise.all(
			chunk.map((batch) => fetchBatch(archiveUrl, batch.locs, startDate, endDate)),
		);

		for (let c = 0; c < chunk.length; c++) {
			for (let j = 0; j < results[c].length; j++) {
				data.set(chunk[c].indices[j], results[c][j]);
			}
			completed++;
		}

		const elapsed = (Date.now() - startTime) / 1000;
		const rate = completed / elapsed;
		const remaining = Math.ceil((total - completed) / rate);
		process.stdout.write(
			`\rBatch ${completed}/${total} | ${data.size}/${totalLocations} locs | ${elapsed.toFixed(0)}s elapsed | ~${remaining}s left   `,
		);
	}

	process.stdout.write("\n\n");
	const totalSeconds = ((Date.now() - startTime) / 1000).toFixed(0);
	console.log(`Fetched all ${data.size} locations in ${completed} requests, ${totalSeconds}s.`);
	return data;
}

async function fetchRemote(
	archiveUrl: string,
	batches: Batch[],
	totalLocations: number,
	startDate: string,
	endDate: string,
	resumeFrom?: boolean,
): Promise<Map<number, DailyData>> {
	let data = new Map<number, DailyData>();
	let startBatch = 0;
	let requestCount = 1;

	if (resumeFrom) {
		const checkpoint = await loadCheckpoint();
		if (checkpoint) {
			data = checkpoint.data;
			startBatch = checkpoint.lastCompletedBatch + 1;
			requestCount = checkpoint.requestCount;
			console.log(
				`Resuming from checkpoint: ${data.size} locations fetched, ${requestCount} API calls used, starting at batch ${startBatch}`,
			);
		} else {
			console.log("No checkpoint found, starting from scratch");
		}
	}

	const totalBatches = batches.length;
	let completedSinceResume = 0;
	const fetchStartTime = Date.now();

	console.log(
		`${totalLocations} locations in ${totalBatches} batches of ${REMOTE_BATCH_SIZE}. Budget: ${REMOTE_BUDGET} requests.`,
	);
	console.log(
		`Delay between batches: ${REMOTE_DELAY_MS / 1000}s. Estimated time: ${formatEta(totalBatches - startBatch, REMOTE_DELAY_MS + 3000)}\n`,
	);

	for (let b = startBatch; b < totalBatches; b++) {
		if (requestCount >= REMOTE_BUDGET) {
			await saveCheckpoint(b - 1, data, requestCount);
			throw new BudgetExhaustedError(requestCount, REMOTE_BUDGET);
		}

		const batch = batches[b];
		const msPerBatch =
			completedSinceResume > 0
				? (Date.now() - fetchStartTime) / completedSinceResume
				: REMOTE_DELAY_MS + 3000;
		const remaining = totalBatches - b;
		const eta = formatEta(remaining, msPerBatch);

		process.stdout.write(
			`\rBatch ${b + 1}/${totalBatches} (${batch.locs.length} locs) | ${data.size}/${totalLocations} done | ${requestCount}/${REMOTE_BUDGET} API calls | ETA: ${eta}   `,
		);

		try {
			const results = await fetchBatch(archiveUrl, batch.locs, startDate, endDate);
			requestCount++;

			for (let j = 0; j < results.length; j++) {
				data.set(batch.indices[j], results[j]);
			}

			completedSinceResume++;

			if (completedSinceResume % CHECKPOINT_INTERVAL === 0) {
				await saveCheckpoint(b, data, requestCount);
				process.stdout.write(" [saved]");
			}
		} catch (err) {
			await saveCheckpoint(b > 0 ? b - 1 : 0, data, requestCount);
			console.log(`\n\nCheckpoint saved at batch ${b}. Resume with --resume.`);
			throw err;
		}

		if (b < totalBatches - 1) {
			await sleep(REMOTE_DELAY_MS);
		}
	}

	process.stdout.write("\n\n");
	console.log(`Fetched all ${data.size} locations in ${requestCount} API calls.`);

	await saveCheckpoint(totalBatches - 1, data, requestCount);
	return data;
}
