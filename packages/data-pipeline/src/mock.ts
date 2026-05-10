import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { antipodal, fibonacciSphere } from "@antipodal/geo";

const GRID_SIZE = 500;
const OUTPUT_DIR = join(process.cwd(), "output");
const MONTHS_DIR = join(OUTPUT_DIR, "months");

interface GridPoint {
	lat: number;
	lng: number;
	antiLat: number;
	antiLng: number;
}

function tempForLatMonth(lat: number, month: number): number {
	const tropicalBase = 25 - Math.abs(lat) * 0.5;
	const seasonalSwing = (Math.abs(lat) / 90) * 20;
	const northernOffset =
		lat >= 0 ? Math.cos(((month - 7) / 6) * Math.PI) : Math.cos(((month - 1) / 6) * Math.PI);
	return tropicalBase + seasonalSwing * northernOffset + (Math.random() - 0.5) * 4;
}

function pressureForLatMonth(lat: number, month: number): number {
	const base = 1013.25;
	const latEffect = -5 * Math.cos((lat / 90) * Math.PI * 2);
	const seasonalEffect = 3 * Math.sin(((month - 1) / 12) * Math.PI * 2);
	return base + latEffect + seasonalEffect + (Math.random() - 0.5) * 8;
}

function daysInMonth(year: number, month: number): number {
	return new Date(year, month, 0).getDate();
}

async function main() {
	console.log(`Generating mock data for ${GRID_SIZE} grid points`);

	const rawGrid = fibonacciSphere(GRID_SIZE);
	const grid: GridPoint[] = rawGrid.map((pt) => {
		const anti = antipodal(pt.lat, pt.lng);
		return { lat: pt.lat, lng: pt.lng, antiLat: anti.lat, antiLng: anti.lng };
	});

	await mkdir(MONTHS_DIR, { recursive: true });
	await writeFile(join(OUTPUT_DIR, "grid.json"), JSON.stringify(grid));
	console.log(`Wrote grid.json (${grid.length} points)`);

	let monthCount = 0;
	for (let year = 1940; year <= 2024; year++) {
		for (let m = 1; m <= 12; m++) {
			const monthKey = `${year}-${String(m).padStart(2, "0")}`;
			const days: Record<
				string,
				Array<{ t1: number | null; p1: number | null; t2: number | null; p2: number | null }>
			> = {};
			const numDays = daysInMonth(year, m);

			for (let d = 1; d <= numDays; d++) {
				const dateStr = `${monthKey}-${String(d).padStart(2, "0")}`;
				const entries = grid.map((pt) => ({
					t1: Math.round(tempForLatMonth(pt.lat, m) * 10) / 10,
					p1: Math.round(pressureForLatMonth(pt.lat, m) * 10) / 10,
					t2: Math.round(tempForLatMonth(pt.antiLat, m) * 10) / 10,
					p2: Math.round(pressureForLatMonth(pt.antiLat, m) * 10) / 10,
				}));
				days[dateStr] = entries;
			}

			await writeFile(join(MONTHS_DIR, `${monthKey}.json`), JSON.stringify({ days }));
			monthCount++;
		}
		if (year % 10 === 0) console.log(`  ${year}...`);
	}

	const summary = {
		gridPoints: GRID_SIZE,
		startDate: "1940-01-01",
		endDate: "2024-12-31",
		monthCount,
		generatedAt: new Date().toISOString(),
		mock: true,
	};
	await writeFile(join(OUTPUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));

	console.log(`Wrote ${monthCount} monthly files + grid.json + summary.json`);
	console.log("NOTE: This is mock data based on latitude/seasonal models, not real observations.");
}

main().catch((err) => {
	console.error("Mock generation failed:", err);
	process.exit(1);
});
