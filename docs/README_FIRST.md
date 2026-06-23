# PARK-GUARD Codex Handoff — Read This First

This package contains the specification and staged prompts for building the PARK-GUARD web prototype with Codex inside VS Code.

## Final technical decision

- Frontend only
- React + Vite
- JavaScript, not TypeScript
- npm
- Tailwind CSS + shadcn/ui
- MapLibre GL JS with MapTiler hosted vector basemap
- Recharts
- Lucide React
- React Router
- Static, preprocessed JSON and GeoJSON
- `localStorage` for interface preferences
- No database
- No Express backend
- No authentication
- Vercel deployment
- Desktop-first with tablet support

## Source files to place in the repository before Codex starts

Create this folder structure:

```text
park-guard/
├── input-data/
│   ├── prototype_dispatch_recommendations.csv
│   ├── prototype_hourly_dispatch_schedule.csv
│   ├── latest_dispatch_recommendations.csv
│   ├── prototype_schema_manifest.csv
│   ├── consolidated_evaluation_summary.csv
│   ├── MODEL_CARD.md
│   └── zone_lookup_250m.parquet
│
└── docs/
    ├── MASTER_SPEC.md
    ├── DATA_CONTRACT.md
    ├── EVALUATION_RESULTS.md
    ├── CODEX_OPERATING_RULES.md
    └── STAGED_PROMPTS.md
```

Optional archival inputs, which the browser must not load directly:

```text
input-data/
├── prototype_dispatch_recommendations.parquet
└── prototype_dispatch_recommendations.geojson
```

## Files in this handoff package

- `MASTER_SPEC.md`: complete product and UI specification
- `DATA_CONTRACT.md`: exact frontend data contract
- `EVALUATION_RESULTS.md`: validated metrics and approved claims
- `CODEX_OPERATING_RULES.md`: non-negotiable rules for Codex
- `STAGED_PROMPTS.md`: prompts to execute one stage at a time
- `INITIAL_CODEX_PROMPT.md`: the first prompt to paste into Codex
- `.env.example`: MapTiler credential placeholder

## Recommended workflow

1. Copy these documents into `park-guard/docs/`.
2. Copy `.env.example` to the repository root.
3. Put all source output files under `input-data/`.
4. Open the repository root in VS Code.
5. Paste `INITIAL_CODEX_PROMPT.md` into Codex.
6. Do not ask Codex to build everything at once.
7. Use `STAGED_PROMPTS.md` sequentially.
8. Review the browser after every visual stage.
9. Require `npm run lint` and `npm run build` after each major stage.
10. Deploy only after the final acceptance checklist passes.

## Credential handling

Create a local `.env` file after obtaining MapTiler credentials:

```bash
cp .env.example .env
```

Never commit `.env` or any real credential.
