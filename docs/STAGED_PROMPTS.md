# PARK-GUARD Staged Codex Prompts

Use these prompts sequentially. Do not paste all stages at once.

---

## Stage 0 — Inspect only

```text
Read every file under docs/, especially MASTER_SPEC.md, DATA_CONTRACT.md, EVALUATION_RESULTS.md, and CODEX_OPERATING_RULES.md.

Inspect the entire repository and the input-data files. Do not modify, create, delete, install, or format anything yet.

Report:
1. current repository structure;
2. source files found and missing;
3. exact columns found in each CSV and Parquet source;
4. whether the data satisfies the documented contract;
5. Mappls credential/documentation information still needed;
6. proposed application architecture;
7. proposed dependencies;
8. proposed file tree;
9. risks or contradictions;
10. a stage-by-stage implementation plan.

Do not make assumptions. Stop after the report and wait for approval.
```

Approval gate: review Codex’s report before Stage 1.

---

## Stage 1 — Scaffold and design foundation

```text
Proceed with Stage 1 only.

Create the React + Vite JavaScript application in the current repository using npm. Configure React Router, Tailwind CSS, shadcn/ui, Lucide React, Recharts, ESLint, the documented folder structure, .gitignore, .env.example, and Vercel SPA routing.

Implement:
- app providers and router;
- semantic CSS variables for the dark navy control-room theme;
- shared layout primitives;
- route shells for /, /command-center, and /about;
- controlled not-found redirect;
- a temporary map-unavailable placeholder, not a fake map.

Do not implement data preprocessing or product screens yet.
Do not add a backend, database, authentication, tests, or mock metrics.

Run npm run lint and npm run build. Report files changed and stop for review.
```

Approval gate: inspect base theme and routes.

---

## Stage 2 — Build the static data pipeline

```text
Proceed with Stage 2 only.

Implement scripts/prepare_web_data.py and requirements-data.txt according to MASTER_SPEC.md and DATA_CONTRACT.md.

The script must:
- read the source files from input-data without modifying them;
- validate required columns and invariants;
- exclude forbidden evaluation fields;
- partition recommendations by IST date;
- generate schedule.json, metadata.json, manifest.json, latest-recommendations.json, evaluation-summary.json, and recommendations/YYYY-MM-DD.json;
- generate exact 250 m zone polygons from centroid_x_m/centroid_y_m in EPSG:32643 and transform them to EPSG:4326;
- validate 1,163 zones, 15,021 recommendation rows, unique recommendation IDs, schedule counts, and latest-hour consistency;
- compute Peak Demo without actual outcomes;
- use 2024-04-08 23:00 IST as the quiet-hour preset after validating it;
- print a concise build summary.

Run the script. Show the summary, output sizes, and any validation issue.
Do not build UI features in this stage.
Stop for review.
```

Approval gate: inspect generated JSON and GeoJSON.

---

## Stage 3 — Landing and About pages

```text
Proceed with Stage 3 only.

Build the final Landing and About pages using generated static data.

Landing requirements:
- PARK-GUARD text-only logo;
- Historical simulation badge;
- launch button;
- three approved headline metrics loaded from evaluation-summary.json;
- workflow section;
- safeguards strip;
- polished dark navy control-room design.

About requirements:
- methodology sections specified in MASTER_SPEC.md;
- role of MapMyIndia;
- incident-pressure definition;
- adaptive deployment;
- confidence;
- scenario limitations;
- no performance dashboard.

Do not hardcode metrics when they exist in generated data.
Do not implement the Command Centre yet.

Run lint and build. Report changes and stop for visual review.
```

Approval gate: user reviews landing/about screenshots.

---

## Stage 4 — Command Centre state and data loading

```text
Proceed with Stage 4 only.

Implement:
- manifest, metadata, schedule, zones, and daily recommendation loaders;
- loading/error/empty states;
- in-memory caching of daily files;
- CommandCenterContext or reducer;
- localStorage persistence under park_guard_ui_state_v1;
- Peak Demo and Quiet Hour presets;
- Simulated Live and Historical modes;
- previous/next/play/pause;
- 0.5x, 1x, and 2x playback;
- date and hour controls;
- Top 5, Top 10, and All recommended capacity control.

Build the Command Centre shell with a map placeholder and a functional recommendation rail.
Do not integrate Mappls yet.
Do not show actual outcomes.

Run lint and build. Stop for functional review.
```

Approval gate: verify timeline and latest-hour count.

---

## Stage 5 — MapMyIndia / Mappls integration

```text
Proceed with Stage 5 only.

Before editing, inspect the supplied Mappls credential/dashboard instructions and identify the exact current Web Maps SDK loading and initialization method. Do not invent an API signature.

Implement the Mappls provider adapter using VITE_MAPPLS_MAP_SDK_KEY.

Required behaviour:
- basemap;
- generated 250 m zone polygons;
- recommended-zone polygons;
- numbered patrol markers;
- action-based colours;
- confidence rings;
- metric-based marker emphasis;
- optional all-zone grid;
- selected-zone 500 m circle;
- synchronized map/list selection;
- pan/zoom on selection;
- controlled map-unavailable state;
- full cleanup of SDK listeners and objects.

Do not use routing, traffic, geocoding, locality names, or external analytical data.

Run lint and build. Test with and without credentials. Stop for map review.
```

Approval gate: user verifies map behaviour.

---

## Stage 6 — Recommendation filters and zone details

```text
Proceed with Stage 6 only.

Implement:
- zone ID and grid ID search;
- confidence filter;
- patrol-action filter;
- disruption-class filter;
- verification-required filter;
- current-incident-evidence filter;
- clear filters;
- visual metric selector;
- synchronized map/list filtering;
- recommendation cards;
- complete zone detail experience;
- reason-code chips;
- confidence explanation;
- evidence sections;
- 30/60/90 scenario simulator using packaged values only;
- expected remaining local pressure calculation;
- mandatory non-causal warning.

Action controls must remain status labels, not interactive dispatch buttons.

Run lint and build. Stop for functional and copy review.
```

Approval gate: verify field meanings and scenario copy.

---

## Stage 7 — Responsive polish and edge cases

```text
Proceed with Stage 7 only.

Polish:
- desktop layouts at 1440 and 1920 widths;
- tablet layouts at 768 and 1024 widths;
- collapsible or sheet-based recommendation panel on tablet;
- keyboard interaction;
- focus states;
- reduced motion;
- zero-deployment hours;
- filter-empty state;
- malformed-data state;
- Mappls failure state;
- refresh persistence;
- Peak Demo and Quiet Hour flows;
- visible IST labelling;
- no horizontal overflow.

Do not add mobile-only features or new product scope.

Run lint and build. Report all manually tested acceptance scenarios.
Stop for review.
```

---

## Stage 8 — README, deployment, and final QA

```text
Proceed with Stage 8 only.

Complete:
- professional README;
- data-preparation instructions;
- Mappls credential setup;
- Vercel setup;
- architecture section;
- limitations and safeguards;
- screenshots placeholders;
- repository structure;
- production commands;
- vercel.json;
- final package and dependency audit.

Perform the complete Definition of Done and Final Acceptance Scenarios from MASTER_SPEC.md.

Run:
- npm run lint
- npm run build
- npm run preview

Report:
1. final route list;
2. final dependencies;
3. generated data counts;
4. bundle/build output;
5. acceptance scenarios passed/failed;
6. known limitations;
7. exact Vercel deployment steps.

Do not claim the project is complete if any required scenario fails.
```
