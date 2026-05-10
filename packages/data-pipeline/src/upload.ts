import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { GridPoint, MonthlyData } from "./transform.js";

const OUTPUT_DIR = join(process.cwd(), "output");
const MONTHS_DIR = join(OUTPUT_DIR, "months");

export async function ensureOutputDirs(): Promise<void> {
	await mkdir(MONTHS_DIR, { recursive: true });
}

export async function writeMonthlyFiles(monthlyData: Map<string, MonthlyData>): Promise<number> {
	let count = 0;
	for (const [monthKey, data] of monthlyData) {
		await writeFile(join(MONTHS_DIR, `${monthKey}.json`), JSON.stringify(data));
		count++;
	}
	return count;
}

export async function writeGrid(grid: GridPoint[]): Promise<void> {
	await writeFile(join(OUTPUT_DIR, "grid.json"), JSON.stringify(grid));
	console.log(`Wrote grid.json (${grid.length} points)`);
}

export async function writeSummary(options: {
	gridPoints: number;
	startDate: string;
	endDate: string;
	monthCount: number;
}): Promise<void> {
	const summary = {
		gridPoints: options.gridPoints,
		startDate: options.startDate,
		endDate: options.endDate,
		monthCount: options.monthCount,
		generatedAt: new Date().toISOString(),
	};
	await writeFile(join(OUTPUT_DIR, "summary.json"), JSON.stringify(summary, null, 2));
}

export async function logOutputStats(): Promise<void> {
	const files = await readdir(MONTHS_DIR);
	let totalBytes = 0;
	for (const f of files) {
		const s = await stat(join(MONTHS_DIR, f));
		totalBytes += s.size;
	}
	const gridStat = await stat(join(OUTPUT_DIR, "grid.json"));
	const summaryStat = await stat(join(OUTPUT_DIR, "summary.json"));
	totalBytes += gridStat.size + summaryStat.size;

	console.log(
		`${files.length} monthly files + grid.json + summary.json (${(totalBytes / 1024 / 1024).toFixed(1)} MB total)`,
	);
}
