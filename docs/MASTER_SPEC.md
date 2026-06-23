# PARK-GUARD Web Prototype — Master Specification

## 1. Document purpose

This document is the single source of truth for implementing the PARK-GUARD web prototype. Codex must read this document, `DATA_CONTRACT.md`, `EVALUATION_RESULTS.md`, and `CODEX_OPERATING_RULES.md` before changing source code.

When a requested implementation conflicts with this document, Codex must stop, explain the conflict, and ask for approval. It must not silently invent behaviour, fields, metrics, routes, backend services, or product claims.

---

## 2. Product overview

### 2.1 Product name

Display the product name as:

```text
PARK-GUARD
```

The logo is text-only. Do not add a team name, institution logo, competition logo, partner logo, tagline, or traffic-police logo unless the user later supplies and approves it.

### 2.2 Problem

Parking-violation records are usually inspected retrospectively. Static heatmaps show where incidents occurred, but they do not reliably answer:

- Which 250 m zones are likely to experience parking pressure in the next hour?
- Which recommendations are supported by current obstruction evidence?
- Which recommendations have limited observation reliability and need verification?
- How many patrols are actually justified during a given hour?
- How can patrols be distributed without repeatedly covering nearby zones?

### 2.3 Solution

PARK-GUARD is a decision-support dashboard for traffic-control-room operators. It:

1. replays historical hourly forecasts as a simulated operational environment;
2. displays adaptive patrol recommendations for 250 m zones;
3. explains each recommendation using current activity, recurrence, nearby activity, obstruction evidence, and confidence;
4. allows operators to explore 30%, 60%, and 90% hypothetical enforcement scenarios;
5. balances direct risk with 500 m neighbourhood coverage;
6. recommends fewer or zero patrols during low-risk hours.

### 2.4 Primary user

One user role only:

```text
Traffic control-room operator
```

No role switching, field-officer portal, admin portal, or authentication is required.

---

## 3. Product truth and mandatory limitations

These statements are non-negotiable.

### 3.1 What the product predicts

The model forecasts:

```text
Next-hour parking-incident pressure for a 250 m zone
```

It does not directly predict measured traffic speed, travel time, traffic-flow delay, legal guilt, or causal congestion reduction.

### 3.2 Historical simulation

The supplied data covers a historical period. The interface may provide a `Simulated Live` mode, but it must always be visibly labelled as a historical simulation.

Do not display:

- `Live now`
- `Real-time traffic`
- `Current Bengaluru incidents`
- any wording that makes the historical replay look like a live production feed

Approved wording:

- `Simulated Live`
- `Historical simulation`
- `Forecast replay`
- `Historical target hour`

### 3.3 Basemap usage

The prototype uses a hosted vector basemap for geographic context. In this prototype:

- The operational dashboard uses a hosted vector basemap for geographic context. Basemap data is used only for visualisation and is not included in the PARK-GUARD forecasting or prioritisation model.
- It may display the application’s existing coordinates, zone polygons, patrol markers, popups, and 500 m geodesic coverage areas.
- It must not supply analytical model features.
- It must not inject external traffic values, road geometry, reverse-geocoded locality labels, route optimization, or congestion measurements into the model output.
- Do not claim basemap, routing, traffic, geocoding, or reverse-geocoding data was used by the trained model unless such integration is implemented and separately validated later.

### 3.4 Scenario estimates

The fields representing 30%, 60%, and 90% pressure removed are hypothetical local suppression scenarios.

The interface must show this warning near the simulator:

```text
Scenario estimates are hypothetical local pressure-suppression values, not causal guarantees of congestion reduction.
```

Never use claims such as:

- `Guaranteed incidents prevented`
- `Congestion reduced by 60%`
- `Causal enforcement impact`
- `Traffic saved`

### 3.5 Spatial context

Neighbourhood context is used for ranking and patrol coverage.

Never describe it as:

- learned propagation;
- congestion spreading through the graph;
- causal spillover;
- predicted traffic flow from one zone to another.

Approved wording:

```text
Nearby parking activity
```

### 3.6 Human oversight

The application is decision support only.

- It must not automatically issue penalties.
- It must not infer legal guilt.
- Low-confidence recommendations must show `Verify before enforcement`.
- Action labels are recommendations, not interactive dispatch commands.

---

## 4. Scope

### 4.1 Included

- Landing page
- Command Centre
- About page
- Historical replay
- Simulated-live replay
- MapLibre / MapTiler map
- Adaptive recommendations
- Zone ID search
- Recommendation filters
- Top 5 / Top 10 / all adaptive recommendations
- Map and list synchronization
- Exact 250 m zone polygons generated from the lookup file
- 500 m selected-zone coverage circle
- Zone detail experience
- Scenario simulator inside zone detail
- Data-confidence display
- Obstruction-evidence display
- Local persistence of UI preferences
- Loading, error, empty, and map-unavailable states
- Desktop-first design with tablet support
- Vercel deployment configuration
- Professional README for the web application

### 4.2 Excluded

- Backend
- Express
- Database
- Authentication
- Dataset upload
- Running the ML pipeline in the browser
- Actual officer dispatch
- Editable officer notes
- Acknowledgement/completion actions
- Notifications
- Data export controls
- Performance dashboard page
- Actual future outcomes in operational views
- Real-time API feeds
- Route optimization
- Locality-name search
- Mobile-first optimisation
- Automated penalties
- Tests or test-framework dependencies, unless later requested

---

## 5. Technical architecture

### 5.1 Required stack

```text
React
Vite
JavaScript
npm
React Router
Tailwind CSS
shadcn/ui
Recharts
Lucide React
MapLibre GL JS with MapTiler hosted vector basemap
```

Use React Context and focused custom hooks for shared state. Do not add Redux, Zustand, MobX, TanStack Query, or another state-management package unless the user explicitly approves it.

### 5.2 Frontend-only architecture

The deployed application is a static Vite build.

```text
Source CSV/Parquet files
        ↓ one-time preprocessing
Date-partitioned JSON + zone GeoJSON
        ↓ static files in public/data
React application
        ↓
MapLibre visualisation + interactive control-room UI
```

No network request is required except:

- loading the deployed static assets;
- loading hosted basemap resources.

### 5.3 Environment variables

Use:

```text
VITE_MAPTILER_API_KEY
VITE_MAPTILER_STYLE_ID
VITE_DATA_BASE_URL
```

`VITE_DATA_BASE_URL` defaults to `/data`.

Do not hardcode basemap credentials. Do not log credentials. Do not commit `.env`.

Map integration must follow the configured MapLibre / MapTiler contract. If the credential type or style configuration cannot be determined from the provided credential/dashboard instructions, Codex must ask before inventing a contract.

### 5.4 Recommended source structure

```text
park-guard/
├── input-data/
├── public/
│   └── data/
│       ├── manifest.json
│       ├── metadata.json
│       ├── schedule.json
│       ├── latest-recommendations.json
│       ├── evaluation-summary.json
│       ├── zones.geojson
│       └── recommendations/
│           └── YYYY-MM-DD.json
├── scripts/
│   └── prepare_web_data.py
├── src/
│   ├── app/
│   │   ├── router.jsx
│   │   └── AppProviders.jsx
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   ├── map/
│   │   ├── recommendations/
│   │   ├── scenario/
│   │   └── timeline/
│   ├── context/
│   │   └── CommandCenterContext.jsx
│   ├── hooks/
│   ├── lib/
│   │   ├── data/
│   │   ├── map/
│   │   ├── formatting/
│   │   └── storage/
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── CommandCenterPage.jsx
│   │   └── AboutPage.jsx
│   ├── styles/
│   ├── main.jsx
│   └── index.css
├── docs/
├── .env.example
├── .gitignore
├── eslint.config.js
├── package.json
├── vite.config.js
├── vercel.json
└── README.md
```

Codex may refine component names but must preserve the separation between:

- data loading;
- map-provider integration;
- application state;
- pages;
- presentational components.

### 5.5 Map adapter

Map-renderer logic must be isolated from application state.

Suggested boundary:

```text
src/lib/map/mapConfig.js
src/lib/map/mapStyles.js
src/lib/map/geoJsonUtils.js
src/components/map/ParkGuardMap.jsx
```

The rest of the application should pass plain objects such as:

```js
{
  selectedHour,
  recommendations,
  selectedZoneId,
  visibleMetric,
  showAllZones,
  onSelectZone
}
```

Do not spread map-renderer calls across unrelated components.

---

## 6. Data preparation

### 6.1 Inputs

The preprocessing script reads:

```text
input-data/prototype_dispatch_recommendations.csv
input-data/prototype_hourly_dispatch_schedule.csv
input-data/latest_dispatch_recommendations.csv
input-data/prototype_schema_manifest.csv
input-data/consolidated_evaluation_summary.csv
input-data/MODEL_CARD.md
input-data/zone_lookup_250m.parquet
```

The existing full GeoJSON and recommendation Parquet files may be retained as archives, but the web build must not load them.

### 6.2 Preprocessing language

Use a Python script:

```text
scripts/prepare_web_data.py
```

The script may use:

```text
pandas
pyarrow
pyproj
```

It is a one-time data-build utility. Generated assets are committed to `public/data`, so Python is not needed at Vercel runtime.

Provide a small `requirements-data.txt` for this script.

### 6.3 Required outputs

```text
public/data/
├── manifest.json
├── metadata.json
├── schedule.json
├── latest-recommendations.json
├── evaluation-summary.json
├── zones.geojson
└── recommendations/
    ├── 2024-02-23.json
    ├── ...
    └── 2024-04-08.json
```

### 6.4 Date partitioning

Partition recommendations by target date in IST.

Each daily file contains all recommendations for the date, grouped or sortable by `target_time`.

Do not create one large initial JSON payload containing all 15,021 recommendations.

### 6.5 Zone polygons

Use `zone_lookup_250m.parquet`.

Required lookup fields:

```text
zone_index
zone_250m
latitude
longitude
centroid_x_m
centroid_y_m
```

The projected coordinates use EPSG:32643.

For each zone:

1. treat `centroid_x_m`, `centroid_y_m` as the centre;
2. construct a 250 m square using ±125 m on x and y;
3. transform the four corners from EPSG:32643 to EPSG:4326;
4. emit a GeoJSON polygon;
5. include `zone_index` and `zone_250m` in properties.

Validate that all 1,163 zones are present.

### 6.6 Derived metadata

`metadata.json` must contain:

- minimum target time;
- maximum target time;
- available dates;
- number of analysis zones;
- recommendation row count;
- latest historical hour;
- quiet-hour preset;
- peak-demo preset;
- default timezone: `Asia/Kolkata`;
- dispatch threshold score;
- patrol balancing alpha;
- coverage radius.

### 6.7 Peak-demo preset

Do not hardcode a visually attractive hour manually.

Compute the default `Peak Demo` hour from operational fields only:

1. maximize `recommended_patrols`;
2. among ties, maximize sum of `spatial_priority_score`;
3. among further ties, choose the earliest timestamp.

Do not use actual future outcomes.

### 6.8 Quiet-hour preset

Use the latest historical hour:

```text
2024-04-08 23:00 IST
```

The current packaged output has three recommendations at this hour. Validate rather than silently assuming the count.

### 6.9 Validation

The preprocessing script must fail with a clear message when:

- required files are missing;
- required fields are missing;
- timestamps cannot be parsed;
- latitude/longitude are invalid;
- duplicate `(target_time, zone_index)` rows exist;
- selection orders are outside 1–25;
- a recommendation score is below the packaged dispatch threshold;
- schedule counts disagree with recommendation counts;
- zone lookup does not contain all referenced zones.

The script must print a concise build summary.

---

## 7. Routes and pages

Required routes:

```text
/
/command-center
/about
```

Unknown routes should redirect to `/`.

### 7.1 Landing page

Purpose: explain the problem and launch the product without overwhelming the judge.

Required sections:

#### Hero

- Text logo: `PARK-GUARD`
- Heading focused on predictive parking enforcement
- One concise paragraph
- Primary button: `Launch Command Centre`
- Secondary text link: `How it works`
- Badge: `Historical simulation`

Do not add an unapproved tagline under the logo. The hero heading may describe the product, but is not part of the logo.

#### Three credibility metrics

Display exactly these validated metrics from the evaluation file:

- 39.93% pressure capture at K=25
- 50.24% hotspot recall at K=25
- 44.7% fewer average patrol deployments at nominal capacity 25

Add a caption:

```text
Evaluated on the held-out historical test period.
```

#### Workflow

Use a clean horizontal or stepped visual:

```text
Incident records
→ hourly 250 m zones
→ next-hour pressure forecast
→ confidence and obstruction evidence
→ adaptive patrol plan
```

#### Safeguard strip

Show three short points:

- Human verification for low-confidence zones
- No automatic penalties
- Scenario estimates are non-causal

### 7.2 Command Centre

This is the primary product page.

#### Desktop layout

Recommended layout at widths ≥1280 px:

- Global header: 64–72 px
- Main content beneath header
- Map: approximately 68–72% width
- Recommendation rail: approximately 28–32% width
- Timeline controls integrated above or below map
- Zone detail may replace the rail content or open as a large sheet without hiding the full map

#### Tablet layout

At 768–1279 px:

- Map remains the primary element
- Recommendation rail becomes a collapsible bottom sheet or stacked panel
- Header controls may wrap into two rows
- No horizontal page overflow
- Important controls must remain reachable without tiny targets

#### Header

Required:

- PARK-GUARD text logo
- `Simulated Live` / `Historical` mode switch
- Current selected target time in IST
- Link to About
- No user avatar
- No notification bell
- No fake connectivity status

#### Summary cards

Use four compact cards:

1. Recommended patrols
2. Highest severe-hotspot probability
3. Mean selected data confidence
4. Zones requiring verification

Values must update with the selected hour and current display subset where appropriate.

#### Time controls

Required:

- Previous hour
- Next hour
- Play/pause
- Playback speeds: 0.5×, 1×, 2×
- Date picker limited to available dates
- Hour selector limited to available target hours
- `Peak Demo` preset
- `Quiet Hour` preset

All timestamps show IST.

In `Simulated Live` mode:

- clearly show `Historical simulation`;
- start from the peak-demo preset on first use;
- advance through available historical hours;
- do not map the historical time to the user’s present date;
- stop at the end rather than pretending new data arrived.

In `Historical` mode:

- manual controls remain available;
- play/pause may still replay history.

#### Recommendation capacity control

Options:

- `Top 5`
- `Top 10`
- `All recommended (N)`

Never invent missing recommendations to fill capacity. If N is 3, all modes show at most 3.

#### Search

Search by exact or partial zone ID:

- numeric `zone_index`;
- grid label `zone_250m`.

No locality-name search.

#### Filters

Required filters:

- confidence tier;
- patrol action;
- disruption class;
- verification required;
- current incident evidence.

Filters affect list and map simultaneously.

Provide `Clear filters`.

#### Visual metric control

Allow the operator to visualize marker emphasis by:

- Patrol priority
- Expected parking pressure
- Severe hotspot probability
- Data confidence

This changes marker size/glow/intensity and displayed legend. It must not alter the model’s `selection_order`.

#### Recommendation list

Each row/card shows:

- selection order;
- zone ID;
- dispatch tier;
- patrol action;
- expected parking pressure;
- severe hotspot probability;
- confidence badge;
- verification badge when relevant;
- one-line explanation.

Clicking a recommendation:

- selects the map marker and polygon;
- pans/zooms to the zone;
- opens zone details;
- shows the 500 m coverage circle.

#### Empty states

When an hour has no recommendations:

```text
No deployment recommended for this hour
```

Supporting copy:

```text
No zone exceeded the validation-selected dispatch threshold.
```

When filters remove all visible recommendations:

```text
No recommendations match the selected filters.
```

Do not confuse this with a zero-deployment hour.

### 7.3 Zone detail

Zone detail is part of the Command Centre, not a separate route.

Required sections:

#### Identity and action

- Zone ID
- Grid ID
- Selection order
- Patrol action
- Dispatch tier
- Verification status

#### Forecast

- Expected parking pressure
- Patrol priority score
- Severe hotspot probability
- Nearby parking activity

#### Current evidence

- Current incidents
- Unique vehicles
- Active neighbouring zones
- Temporal burst
- Same-hour relative activity
- Consecutive active hours
- Road-interface evidence
- Large-vehicle evidence
- Multiple-offence evidence

Render missing or absent evidence honestly. Do not show a positive claim from a zero value.

#### Confidence

- Data confidence percentage/score
- Confidence tier
- Confidence note
- Verification warning when required

#### Explanation

Show:

- human-readable `evidence_summary`;
- readable chips derived from `reason_codes`.

#### Scenario simulator

Place it inside zone details.

Use a three-position segmented control:

```text
30% | 60% | 90%
```

Do not use a continuous slider, because only these scenarios were generated and validated.

Display:

- selected scenario;
- scenario-estimated local pressure removed;
- expected remaining local pressure, computed as:
  `max(calibrated_pressure - selected_scenario_removed, 0)`;
- mandatory non-causal warning.

The interface must not sum neighbourhood values into claimed congestion reduction.

### 7.4 About page

The About page contains methodology and safeguards, not a performance dashboard.

Required sections:

1. What PARK-GUARD does
2. Data flow
3. Why it is more than a static heatmap
4. Forecasting and calibration
5. Obstruction evidence
6. Data confidence
7. Balanced patrol coverage
8. Adaptive deployment
9. Basemap role
10. Limitations and safeguards

A compact validated-results strip may repeat the three landing metrics, but do not add a complex chart-heavy performance page.

---

## 8. Map behaviour

### 8.1 Layers

Required map layers:

1. Hosted vector basemap
2. Optional faint full 250 m analysis grid
3. Recommended-zone polygons for selected hour
4. Numbered patrol markers
5. Selected-zone 500 m geodesic coverage area

Provide a toggle:

```text
Show all analysis zones
```

Default: off.

### 8.2 No clustering

Do not cluster markers. At most 25 recommendations are visible for an hour.

### 8.3 Marker colour

Marker colour represents recommended operational action:

- Targeted obstruction enforcement: red
- Verify before enforcement: amber
- Active parking enforcement: blue
- Preventive patrol: cyan

Use accessible tokens, not hardcoded colours in many components.

### 8.4 Confidence encoding

Confidence is secondary:

- marker outline/ring;
- badge in list and detail;
- not the main marker colour.

Suggested rings:

- high: solid bright ring;
- medium: muted ring;
- low: dashed or amber ring.

Do not rely on colour alone; tooltips and badges must state the confidence tier.

### 8.5 Marker emphasis

The selected visual metric controls marker size or glow:

- priority score;
- expected pressure;
- hotspot probability;
- confidence.

Use robust normalization within the selected hour. Prevent a single outlier from making other markers invisible. A quantile or clamped min/max scale is acceptable.

### 8.6 Polygon style

Recommended polygons:

- low-opacity fill based on action;
- visible outline;
- stronger outline on hover/selection.

All-zone grid:

- very faint line only;
- hidden at low zoom if it harms readability.

### 8.7 Selection

List selection and map selection must stay synchronized.

Selected zone:

- marker emphasized;
- polygon emphasized;
- 500 m circle displayed;
- details opened;
- selected row highlighted.

### 8.8 Map failure

If basemap credentials are missing or map loading fails:

- display a clear map-unavailable panel;
- show setup guidance in development;
- keep recommendation list, filters, timeline, and zone details usable;
- provide a retry action;
- do not silently switch to another mapping provider.

---

## 9. Design system

### 9.1 Theme

Dark navy control-room theme.

Visual qualities:

- operational;
- calm;
- data-dense without clutter;
- high contrast;
- restrained glow;
- not a gaming dashboard;
- not neon cyberpunk;
- not a generic admin template.

### 9.2 Suggested colour roles

Codex may tune exact values while preserving these semantic roles:

- App background: very dark navy
- Elevated surfaces: navy/slate
- Borders: muted blue-grey
- Primary/cyan: preventive and selected operational elements
- Red: targeted obstruction enforcement
- Amber: verification required
- Blue: active parking enforcement
- Green: high confidence or healthy state only
- Muted text: cool grey
- Main text: near-white

Use CSS variables and Tailwind semantic tokens.

### 9.3 Typography

Use a clean sans-serif available through a free web font or reliable system stack. Prefer clarity over decorative branding.

Use tabular numerals for metrics and timestamps where practical.

### 9.4 Cards and surfaces

- Moderate radius
- Thin borders
- Subtle shadows
- Limited blur
- Avoid excessive glassmorphism
- Avoid giant empty cards
- Avoid decorative gradients behind every section

### 9.5 Motion

Use small, purposeful transitions:

- panel open/close;
- marker selection;
- timeline progress;
- hover state.

Respect `prefers-reduced-motion`.

Do not add background particles, looping decorative animations, or distracting map pulses.

### 9.6 Icons

Use Lucide React. Do not mix icon libraries.

### 9.7 Charts

Use Recharts only where needed, primarily:

- compact timeline/activity sparkline;
- scenario comparison;
- small methodology illustration if appropriate.

Do not create a performance dashboard.

---

## 10. Application state

Use one command-centre context or reducer containing:

- mode: `simulated-live` or `historical`;
- selected target time;
- playback status;
- playback speed;
- capacity view: 5, 10, or all;
- selected zone ID;
- search query;
- active filters;
- visible metric;
- show-all-zones toggle;
- scenario level: 30, 60, or 90;
- recommendation-rail state on tablet.

Persist only UI preferences to:

```text
localStorage key: park_guard_ui_state_v1
```

Persist:

- mode;
- selected target time;
- playback speed;
- capacity;
- filters;
- visible metric;
- show-all-zones;
- scenario;
- last selected zone.

Do not persist fictional dispatch actions.

When stored state references an unavailable timestamp or zone, fall back safely to the peak-demo preset.

---

## 11. Data loading

### 11.1 Initial load

Initial page load should fetch only:

- manifest;
- metadata;
- schedule;
- evaluation summary;
- zones GeoJSON when entering Command Centre;
- selected date recommendation file.

### 11.2 Caching

Cache loaded daily recommendation files in memory for the session.

Optionally prefetch adjacent days after the current day loads.

### 11.3 Error handling

Every data loader must distinguish:

- network/load error;
- malformed JSON;
- empty valid data;
- unavailable date;
- missing basemap credential.

Show user-friendly messages and log developer details without exposing credentials.

### 11.4 Data integrity

At runtime, validate critical fields before rendering. A lightweight manual validator is sufficient; do not add a schema library unless approved.

---

## 12. Copy and terminology

Use these user-facing labels:

| Technical field | User-facing label |
|---|---|
| calibrated_pressure | Expected parking pressure |
| spatial_priority_score | Patrol priority score |
| hotspot_probability | Severe hotspot probability |
| observation_confidence | Data confidence |
| local_pressure_removed_* | Scenario-estimated local reduction |
| distance_neighbour_exposure | Nearby parking activity |
| disruption_class | Obstruction evidence |
| adaptive dispatch | Recommended patrol deployment |

Preferred wording:

- `zone`
- `recommendation`
- `patrol`
- `verify`
- `historical simulation`
- `expected pressure`
- `evidence`
- `confidence`

Avoid:

- `causal`
- `guaranteed`
- `real-time` without `simulated`
- `crime prediction`
- `automatic enforcement`
- `congestion propagation`
- `traffic reduced`
- `offender identified`

---

## 13. Accessibility

Minimum requirements:

- keyboard-accessible controls;
- visible focus states;
- correct button/link semantics;
- labels for icon-only controls;
- sufficient contrast;
- no information communicated only through colour;
- drawer/sheet focus management;
- Escape closes dismissible panels;
- map has a text alternative through the synchronized recommendation list;
- reduced-motion support.

---

## 14. Performance

Targets:

- no full 10 MB CSV parsing in the browser;
- date-partitioned loading;
- avoid rerendering the map on unrelated state changes;
- memoize filtered recommendation lists;
- lazy-load route-level pages where useful;
- keep map markers under 25;
- avoid loading all recommendation GeoJSON;
- production build must complete without warnings caused by application code.

Do not prematurely add complex optimization libraries.

---

## 15. Vercel deployment

The app is a static Vite deployment.

Provide:

- `vercel.json` SPA rewrite to `/index.html`;
- documented Vercel environment variable setup;
- no serverless functions;
- no Express;
- no database.

MapTiler credentials must be configured through Vercel environment variables.

---

## 16. README requirements

The root README must include:

1. project overview;
2. screenshots placeholder section;
3. feature list;
4. architecture;
5. repository structure;
6. source data files;
7. one-time data preparation;
8. local development instructions;
9. MapTiler credential setup;
10. production build;
11. Vercel deployment;
12. limitations and safeguards;
13. validated headline metrics;
14. acknowledgement that the UI is a historical simulation.

Required commands:

```bash
npm install
npm run dev
npm run lint
npm run build
npm run preview
```

Data preparation:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-data.txt
python scripts/prepare_web_data.py
```

---

## 17. Definition of done

The project is complete only when all conditions pass.

### Functional

- All three routes work.
- Peak Demo and Quiet Hour presets work.
- Simulated-live replay works.
- Historical date/hour selection works.
- All displayed times are IST.
- Top 5, Top 10, and all adaptive views work.
- Zone search works.
- All filters work and synchronize map/list.
- Selecting a marker selects the list item and opens details.
- Selecting a list item moves the map and opens details.
- 500 m coverage circle appears only for the selected recommendation.
- Scenario 30/60/90 values use packaged fields.
- Zero-deployment hours show the correct state.
- Map failure does not break the rest of the application.
- UI preferences persist after refresh.

### Data

- 15,021 recommendations are represented across generated date files.
- 1,163 zone polygons are generated.
- Schedule count matches recommendation count for every hour.
- No actual future outcome field appears in operational assets.
- No recommendation falls below the dispatch threshold.
- Latest hour displays the packaged count, currently expected to be three.

### Visual

- Dark navy control-room theme is consistent.
- Desktop layout is polished at 1440 px and 1920 px.
- Tablet layout is usable at 768 px and 1024 px.
- No horizontal overflow.
- No default shadcn appearance left uncustomized.
- No lorem ipsum or placeholder metrics.
- No unapproved branding.

### Quality

- `npm run lint` passes.
- `npm run build` passes.
- Console has no application errors.
- Missing basemap credentials show a controlled state.
- `.env` is ignored by Git.
- README is complete.
- No backend or database code exists.
- No dependency was added without a clear need.

---

## 18. Final acceptance scenarios

Codex must manually verify these flows.

### Scenario A: Peak Demo

1. Open landing page.
2. Launch Command Centre.
3. Peak Demo is selected.
4. Map and list show adaptive recommendations.
5. Top 5 is visible.
6. Select a recommendation.
7. Verify polygon, marker, circle, details, evidence, and confidence.
8. Change scenario from 30% to 60% to 90%.
9. Values update without changing the forecast.

### Scenario B: Quiet Hour

1. Click Quiet Hour.
2. Time becomes 8 April 2024, 23:00 IST.
3. Exactly the packaged recommendations appear, currently expected to be three.
4. No empty slots or invented recommendations appear.

### Scenario C: Filter and search

1. Search for a zone ID.
2. Apply low-confidence filter.
3. Apply verification-required filter.
4. Map and list remain synchronized.
5. Clear filters returns the full selected-hour set.

### Scenario D: Zero deployment

1. Navigate to an hour with zero recommended patrols.
2. Show the zero-deployment state.
3. Do not show an error.
4. Map remains usable.

### Scenario E: Map failure

1. Remove basemap credential.
2. Reload.
3. Map-unavailable panel appears.
4. List, timeline, filters, and details remain usable.

### Scenario F: Refresh persistence

1. Select a historical time, filters, metric, and scenario.
2. Refresh.
3. Valid preferences are restored.
4. Invalid stale state falls back safely.
