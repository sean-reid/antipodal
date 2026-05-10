import { fibonacciSphere, antipodal } from "@antipodal/geo";
import { fetchAllWeather } from "./fetch.js";
import { transformToMonthlyFiles, type GridPoint } from "./transform.js";
import { writeOutputFiles } from "./upload.js";

const GRID_SIZE = 500;

async function main() {
  const resume = process.argv.includes("--resume");
  const startTime = Date.now();

  console.log(`Generating ${GRID_SIZE}-point Fibonacci sphere grid`);
  const rawGrid = fibonacciSphere(GRID_SIZE);

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
    `Fetching weather data for ${allLocations.length} locations${resume ? " (resuming from checkpoint)" : ""}`,
  );
  const rawData = await fetchAllWeather(allLocations, resume);

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
