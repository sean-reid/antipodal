import { writeFile, mkdir, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import type { GridPoint, MonthlyData } from "./transform.js";

const OUTPUT_DIR = join(process.cwd(), "output");
const MONTHS_DIR = join(OUTPUT_DIR, "months");

export async function writeOutputFiles(
  grid: GridPoint[],
  monthlyData: Map<string, MonthlyData>,
): Promise<void> {
  await mkdir(MONTHS_DIR, { recursive: true });

  await writeFile(
    join(OUTPUT_DIR, "grid.json"),
    JSON.stringify(grid),
  );
  console.log(`Wrote grid.json (${grid.length} points)`);

  let monthCount = 0;
  for (const [monthKey, data] of monthlyData) {
    await writeFile(join(MONTHS_DIR, `${monthKey}.json`), JSON.stringify(data));
    monthCount++;
  }

  const summary = {
    gridPoints: grid.length,
    startDate: "1940-01-01",
    endDate: "2024-12-31",
    monthCount,
    generatedAt: new Date().toISOString(),
  };
  await writeFile(
    join(OUTPUT_DIR, "summary.json"),
    JSON.stringify(summary, null, 2),
  );

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
    `Wrote ${monthCount} monthly files + grid.json + summary.json (${(totalBytes / 1024 / 1024).toFixed(1)} MB total)`,
  );
}
