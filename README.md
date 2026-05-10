# Antipodal

An interactive 3D globe that lets you explore the **Borsuk-Ulam Theorem** using real historical weather data.

The theorem guarantees that at any moment in time, there exist two diametrically opposite points on Earth where both the temperature and barometric pressure are exactly equal. This app lets you see how close any pair of antipodal points gets -- and find the pairs that come closest to proving the theorem empirically.

## How it works

- Click anywhere on the globe to select a point. The app computes its antipode and shows historical temperature and pressure for both locations.
- Scrub through daily weather data from 1940 to present (ERA5 reanalysis via Open-Meteo).
- Run the scanner to visualize all 500 grid points at once and find the antipodal pair with the smallest combined difference.
- Read the educational panel to understand the math behind the guarantee.

## Architecture

Monorepo with pnpm + Turborepo:

- **`apps/web`** -- React SPA with react-globe.gl, deployed on Cloudflare Pages
- **`apps/api`** -- Cloudflare Worker serving pre-computed weather data from R2
- **`packages/geo`** -- Geodesy math (antipodal computation, haversine, Fibonacci sphere grid, IDW interpolation)
- **`packages/data-pipeline`** -- One-time ingestion script that fetches from Open-Meteo and populates R2

## Development

```bash
pnpm install
pnpm dev          # Starts Vite + Wrangler in parallel
pnpm test         # Unit tests across all packages
pnpm e2e          # Playwright E2E tests
pnpm build        # Production build
```

## Data

Weather data comes from the [Open-Meteo Historical Archive](https://open-meteo.com/en/docs/historical-weather-api), which wraps ERA5 reanalysis data from ECMWF. The data pipeline fetches daily temperature and pressure for 500 evenly-distributed points (and their antipodes) and stores the results as compressed JSON in Cloudflare R2.

The pipeline runs at 1 request every 2 seconds to stay well within Open-Meteo's rate limits.

## License

MIT
