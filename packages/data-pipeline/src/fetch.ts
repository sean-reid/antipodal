import { readFile, writeFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

const ARCHIVE_URL = "https://archive-api.open-meteo.com/v1/archive";
const DELAY_MS = 2000;
const BACKOFF_BASE_MS = 30_000;
const BACKOFF_MAX_MS = 180_000;
const MAX_RETRIES = 5;
const CHECKPOINT_INTERVAL = 25;

export interface DailyData {
  time: string[];
  temperature_2m_mean: (number | null)[];
  pressure_msl_mean: (number | null)[];
}

interface Checkpoint {
  lastCompleted: number;
  data: Record<string, DailyData>;
}

const OUTPUT_DIR = join(process.cwd(), "output");
const CHECKPOINT_PATH = join(OUTPUT_DIR, "checkpoint.json");

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  lat: number,
  lng: number,
  startDate: string,
  endDate: string,
): Promise<DailyData> {
  const url = `${ARCHIVE_URL}?latitude=${lat.toFixed(4)}&longitude=${lng.toFixed(4)}&start_date=${startDate}&end_date=${endDate}&daily=temperature_2m_mean,pressure_msl_mean&timezone=UTC`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url);

    if (res.ok) {
      const json = await res.json();
      return json.daily as DailyData;
    }

    const status = res.status;
    if (status === 429 || status >= 500) {
      if (attempt === MAX_RETRIES) {
        throw new Error(
          `Failed after ${MAX_RETRIES} retries for (${lat.toFixed(4)}, ${lng.toFixed(4)}): HTTP ${status}`,
        );
      }
      const backoff = Math.min(
        BACKOFF_BASE_MS * Math.pow(2, attempt),
        BACKOFF_MAX_MS,
      );
      console.log(
        `\nHTTP ${status}, backing off ${backoff / 1000}s (attempt ${attempt + 1}/${MAX_RETRIES})`,
      );
      await sleep(backoff);
      continue;
    }

    throw new Error(
      `Unexpected HTTP ${status} for (${lat.toFixed(4)}, ${lng.toFixed(4)}): ${await res.text()}`,
    );
  }

  throw new Error("Unreachable");
}

async function saveCheckpoint(
  lastCompleted: number,
  data: Map<number, DailyData>,
): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const serializable: Checkpoint = {
    lastCompleted,
    data: Object.fromEntries(data),
  };
  await writeFile(CHECKPOINT_PATH, JSON.stringify(serializable));
}

async function loadCheckpoint(): Promise<{
  lastCompleted: number;
  data: Map<number, DailyData>;
} | null> {
  try {
    const raw = await readFile(CHECKPOINT_PATH, "utf-8");
    const parsed: Checkpoint = JSON.parse(raw);
    return {
      lastCompleted: parsed.lastCompleted,
      data: new Map(
        Object.entries(parsed.data).map(([k, v]) => [Number(k), v]),
      ),
    };
  } catch {
    return null;
  }
}

function formatEta(remainingLocations: number, msPerLocation: number): string {
  const totalMs = remainingLocations * msPerLocation;
  const minutes = Math.ceil(totalMs / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
}

export async function fetchAllWeather(
  locations: Array<{ lat: number; lng: number }>,
  resumeFrom?: boolean,
  startDate = "1940-01-01",
  endDate = "2024-12-31",
): Promise<Map<number, DailyData>> {
  let data = new Map<number, DailyData>();
  let startIndex = 0;

  if (resumeFrom) {
    const checkpoint = await loadCheckpoint();
    if (checkpoint) {
      data = checkpoint.data;
      startIndex = checkpoint.lastCompleted + 1;
      console.log(
        `Resuming from checkpoint: ${data.size} locations already fetched, starting at index ${startIndex}`,
      );
    } else {
      console.log("No checkpoint found, starting from scratch");
    }
  }

  const total = locations.length;
  let completedSinceResume = 0;
  const fetchStartTime = Date.now();

  for (let i = startIndex; i < total; i++) {
    const loc = locations[i];
    const msPerLocation =
      completedSinceResume > 0
        ? (Date.now() - fetchStartTime) / completedSinceResume
        : DELAY_MS + 5000;
    const remaining = total - i;
    const eta = formatEta(remaining, msPerLocation);

    process.stdout.write(
      `\rFetching location ${i + 1}/${total} (${loc.lat.toFixed(2)}, ${loc.lng.toFixed(2)}) ... ETA: ${eta}   `,
    );

    const daily = await fetchWithRetry(loc.lat, loc.lng, startDate, endDate);
    data.set(i, daily);
    completedSinceResume++;

    if (completedSinceResume % CHECKPOINT_INTERVAL === 0) {
      await saveCheckpoint(i, data);
      process.stdout.write(" [checkpoint saved]");
    }

    if (i < total - 1) {
      await sleep(DELAY_MS);
    }
  }

  process.stdout.write("\n");
  console.log(`Fetched ${data.size} locations total`);

  await saveCheckpoint(total - 1, data);
  return data;
}
