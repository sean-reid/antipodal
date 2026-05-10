import { antipodal, fibonacciSphere } from "@antipodal/geo";
import { fetchAllWeather } from "./fetch.js";
import { type GridPoint, transformToMonthlyFiles } from "./transform.js";
import { writeOutputFiles } from "./upload.js";

function parseArgs() {
	const args = process.argv.slice(2);
	const resume = args.includes("--resume");
	const pointsIdx = args.indexOf("--points");
	const gridSize = pointsIdx !== -1 ? Number.parseInt(args[pointsIdx + 1]) : 500;
	const rangeIdx = args.indexOf("--range");
	const startDate = rangeIdx !== -1 ? args[rangeIdx + 1] : "1940-01-01";
	const endDate = rangeIdx !== -1 ? args[rangeIdx + 2] : "2024-12-31";
	return { resume, gridSize, startDate, endDate };
}

async function main() {
	const { resume, gridSize, startDate, endDate } = parseArgs();
	const startTime = Date.now();

	console.log(`Generating ${gridSize}-point Fibonacci sphere grid`);
	const rawGrid = fibonacciSphere(gridSize);

	const grid: GridPoint[] = rawGrid.map((pt) => {
		const anti = antipodal(pt.lat, pt.lng);
		return {
			lat: pt.lat,
			lng: pt.lng,
			antiLat: anti.lat,
			antiLng: anti.lng,
		};
	});

	const allLocations = [
		...grid.map((g) => ({ lat: g.lat, lng: g.lng })),
		...grid.map((g) => ({ lat: g.antiLat, lng: g.antiLng })),
	];

	console.log(
		`Fetching weather data for ${allLocations.length} locations (${startDate} to ${endDate})${resume ? " (resuming)" : ""}`,
	);
	const rawData = await fetchAllWeather(allLocations, resume, startDate, endDate);

	console.log("Transforming to monthly files");
	const monthlyData = transformToMonthlyFiles(grid, rawData);

	console.log("Writing output files");
	await writeOutputFiles(grid, monthlyData);

	const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
	console.log(`Done in ${elapsed} minutes`);
}

main().catch((err) => {
	console.error("Pipeline failed:", err);
	process.exit(1);
});
