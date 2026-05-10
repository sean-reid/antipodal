import { antipodal, fibonacciSphere } from "@antipodal/geo";
import { fetchAllWeather } from "./fetch.js";
import { type GridPoint, transformToMonthlyFiles } from "./transform.js";
import {
	ensureOutputDirs,
	logOutputStats,
	writeGrid,
	writeMonthlyFiles,
	writeSummary,
} from "./upload.js";

const YEARS_PER_CHUNK = 5;

function parseArgs() {
	const args = process.argv.slice(2);
	const resume = args.includes("--resume");
	const pointsIdx = args.indexOf("--points");
	const gridSize = pointsIdx !== -1 ? Number.parseInt(args[pointsIdx + 1]) : 500;
	const rangeIdx = args.indexOf("--range");
	const startDate = rangeIdx !== -1 ? args[rangeIdx + 1] : "1940-01-01";
	const endDate = rangeIdx !== -1 ? args[rangeIdx + 2] : "2024-12-31";
	const baseUrlIdx = args.indexOf("--base-url");
	const baseUrl = baseUrlIdx !== -1 ? args[baseUrlIdx + 1] : undefined;
	return { resume, gridSize, startDate, endDate, baseUrl };
}

function buildChunks(startDate: string, endDate: string): Array<[string, string]> {
	const startYear = Number.parseInt(startDate.slice(0, 4));
	const endYear = Number.parseInt(endDate.slice(0, 4));
	const chunks: Array<[string, string]> = [];

	for (let y = startYear; y <= endYear; y += YEARS_PER_CHUNK) {
		const chunkEndYear = Math.min(y + YEARS_PER_CHUNK - 1, endYear);
		const chunkStart = y === startYear ? startDate : `${y}-01-01`;
		const chunkEnd = chunkEndYear === endYear ? endDate : `${chunkEndYear}-12-31`;
		chunks.push([chunkStart, chunkEnd]);
	}

	return chunks;
}

async function main() {
	const { resume, gridSize, startDate, endDate, baseUrl } = parseArgs();
	const startTime = Date.now();

	console.log(`Generating ${gridSize}-point Fibonacci sphere grid`);
	const rawGrid = fibonacciSphere(gridSize);

	const grid: GridPoint[] = rawGrid.map((pt) => {
		const anti = antipodal(pt.lat, pt.lng);
		return { lat: pt.lat, lng: pt.lng, antiLat: anti.lat, antiLng: anti.lng };
	});

	const allLocations = [
		...grid.map((g) => ({ lat: g.lat, lng: g.lng })),
		...grid.map((g) => ({ lat: g.antiLat, lng: g.antiLng })),
	];

	await ensureOutputDirs();
	await writeGrid(grid);

	const chunks = buildChunks(startDate, endDate);
	let totalMonths = 0;

	console.log(`Fetching weather for ${allLocations.length} locations (${startDate} to ${endDate})`);
	console.log(`Processing in ${chunks.length} chunks of ${YEARS_PER_CHUNK} years\n`);

	for (let i = 0; i < chunks.length; i++) {
		const [chunkStart, chunkEnd] = chunks[i];
		console.log(`\n--- Chunk ${i + 1}/${chunks.length}: ${chunkStart} to ${chunkEnd} ---\n`);

		const rawData = await fetchAllWeather(allLocations, {
			resume: i === 0 ? resume : false,
			startDate: chunkStart,
			endDate: chunkEnd,
			baseUrl,
			skipHealthCheck: i > 0,
		});

		const monthlyData = transformToMonthlyFiles(grid, rawData);
		const written = await writeMonthlyFiles(monthlyData);
		totalMonths += written;

		console.log(`Wrote ${written} monthly files (${totalMonths} total)`);
	}

	await writeSummary({
		gridPoints: grid.length,
		startDate,
		endDate,
		monthCount: totalMonths,
	});

	await logOutputStats();

	const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
	console.log(`\nDone in ${elapsed} minutes.`);
}

main().catch((err) => {
	if (err.name === "DailyLimitError") {
		console.error(`\nABORTED: ${err.message}`);
		console.error(
			"The daily API limit has been reached. Wait until midnight UTC and run again with --resume.",
		);
		process.exit(2);
	}
	if (err.name === "BudgetExhaustedError") {
		console.error(`\n${err.message}`);
		process.exit(2);
	}
	console.error("Pipeline failed:", err);
	process.exit(1);
});
