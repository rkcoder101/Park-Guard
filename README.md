# PARK-GUARD

PARK-GUARD is a static React + Vite web prototype for historical parking-pressure simulation and adaptive patrol recommendation review. It loads packaged JSON and GeoJSON assets from `public/data`, presents a command-centre workflow, and uses a hosted vector basemap only for geographic context.

This UI is a historical simulation. It does not imply live monitoring, automatic enforcement, traffic reduction, or causal congestion impact.

## Screenshots

Screenshots should be added after final visual review:

- Landing page
- Command Centre with hosted vector basemap available
- Command Centre with controlled Map Unavailable state
- Recommendation filters and zone detail panel
- Tablet recommendation sheet

## Features

- Landing and About pages with validated historical metrics.
- Command Centre timeline covering the packaged historical replay period.
- Simulated Live and Historical modes.
- Peak Demo and Quiet Hour shortcuts.
- Previous, next, play/pause, and 0.5x / 1x / 2x replay controls.
- Top 5, Top 10, and All recommended capacity controls.
- Recommendation search and filters for confidence, action, disruption class, verification, and current evidence.
- Zone detail panel with evidence, confidence notes, reason-code chips, and scenario estimates.
- Non-causal 30 / 60 / 90 scenario simulator using packaged values only.
- MapLibre renderer boundary with controlled fallback when basemap configuration or loading fails.
- Static Vercel-compatible SPA routing.

## Validated Metrics

Loaded from `public/data/evaluation-summary.json`:

- Pressure capture at K=25: `39.93%`
- Hotspot recall at K=25: `50.24%`
- Average patrol reduction versus fixed capacity: `44.7%`

These are historical evaluation summaries, not live operational guarantees.

## Architecture

PARK-GUARD has no backend, database, authentication, or serverless API. The browser loads generated static assets directly from `/data`.

- `src/app`: app providers and React Router setup.
- `src/pages`: route-level pages for `/`, `/command-center`, and `/about`.
- `src/context`: Command Centre reducer, derived state, replay controls, persistence, and data loading.
- `src/components`: layout, timeline, recommendation, scenario, and map UI.
- `src/lib/data`: static JSON loading helpers.
- `src/lib/map`: isolated MapLibre configuration, styles, and GeoJSON helpers.
- `src/lib/storage`: localStorage persistence.
- `scripts/prepare_web_data.py`: one-time data build utility.
- `public/data`: generated web-ready static assets.

Basemap rendering is kept out of application state and concentrated in `src/lib/map` plus `src/components/map`.

## Repository Structure

```text
.
├── docs/
├── input-data/
├── public/
│   └── data/
│       ├── evaluation-summary.json
│       ├── latest-recommendations.json
│       ├── manifest.json
│       ├── metadata.json
│       ├── recommendations/
│       ├── schedule.json
│       └── zones.geojson
├── scripts/
│   └── prepare_web_data.py
├── src/
│   ├── app/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   └── pages/
├── .env.example
├── package.json
├── requirements-data.txt
├── vercel.json
└── vite.config.js
```

## Source Data

Required files under `input-data`:

- `MODEL_CARD.md`
- `consolidated_evaluation_summary.csv`
- `latest_dispatch_recommendations.csv`
- `prototype_dispatch_recommendations.csv`
- `prototype_dispatch_recommendations.geojson`
- `prototype_dispatch_recommendations.parquet`
- `prototype_hourly_dispatch_schedule.csv`
- `prototype_schema_manifest.csv`
- `zone_lookup_250m.parquet`

Generated web assets currently include:

- `1,163` zone polygons.
- `15,021` recommendation rows.
- `1,088` schedule hours.
- `46` date-partitioned recommendation files.
- `257` zero-deployment hours.
- Latest historical hour: `2024-04-08T23:00:00+05:30`.
- Quiet Hour preset: `2024-04-08T23:00:00+05:30`, with `3` packaged recommendations.
- Peak Demo preset: `2024-04-07T10:00:00+05:30`, with `25` packaged recommendations.

## One-Time Data Preparation

The Python data script reads from `input-data` and writes generated assets to `public/data`.

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-data.txt
python scripts/prepare_web_data.py
```

The generated assets are committed for static hosting. Python is not required at Vercel runtime.

## Local Development

Install Node dependencies:

```bash
npm install
```

Start the local Vite server:

```bash
npm run dev
```

Useful local routes:

- `http://localhost:5173/`
- `http://localhost:5173/command-center`
- `http://localhost:5173/about`

Quality checks:

```bash
npm run lint
npm run build
npm run preview
```

## Environment Variables

Use `.env.example` as the non-secret template:

```env
VITE_MAPTILER_API_KEY=
VITE_MAPTILER_STYLE_ID=streets-v4
VITE_DATA_BASE_URL=/data
```

Do not commit a real `.env` file. `.env`, `.env.local`, and `.env.*.local` are ignored by Git.

## MapTiler Basemap Setup

Create a MapTiler API key for the deployed hostname. Then set the key as an environment variable:

```bash
npx vercel env add VITE_MAPTILER_API_KEY production
```

Configure the style and data base URL:

```bash
npx vercel env add VITE_MAPTILER_STYLE_ID production
npx vercel env add VITE_DATA_BASE_URL production
```

Use `streets-v4` as the default value for `VITE_MAPTILER_STYLE_ID` and `/data` as the value for `VITE_DATA_BASE_URL`.

If the basemap key is missing or map loading fails, the app shows the controlled map configuration state. Timeline, recommendation filters, list selection, and zone details remain usable.

## Production Build

```bash
npm run lint
npm run build
npm run preview
```

The production output directory is `dist`.

## Vercel Deployment

This is a static Vite deployment. There are no serverless functions.

`vercel.json` provides the SPA rewrite:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

Initial deployment:

```bash
npx vercel
```

Recommended project settings:

- Project name: `park-guard`
- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Development command: `npm run dev`

Production deployment:

```bash
npx vercel --prod
```

Do not upload secret-bearing local `.env` files. Configure MapTiler credentials through Vercel environment variables.

## Limitations and Safeguards

- Historical simulation only; no live feed is implied.
- Recommendations are decision-support signals, not automatic dispatch or enforcement actions.
- Scenario estimates are hypothetical local pressure-suppression values, not causal guarantees of congestion reduction.
- The operational dashboard uses a hosted vector basemap for geographic context. Basemap data is used only for visualisation and is not included in the PARK-GUARD forecasting or prioritisation model.
- The app does not use routing, traffic, geocoding, reverse geocoding, locality names, or external analysis.
- No actual future outcome fields are exposed in operational assets.
- Missing or failing basemap configuration produces a controlled fallback panel.
- No backend, database, authentication, or serverless API is included.

## Dependency Audit

Runtime dependencies are limited to React, React Router, Recharts, Lucide icons, MapLibre GL JS, and small class-name helpers. Development dependencies are Vite, ESLint, Tailwind CSS, PostCSS, Autoprefixer, and React ESLint plugins.

No dependency is used to provide a backend, database, authentication, or serverless runtime.
