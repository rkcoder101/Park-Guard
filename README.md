# PARK-GUARD

### Predictive Parking-Enforcement Intelligence for Congestion Prevention

PARK-GUARD is an AI-powered decision-support system that helps traffic police and smart-city control rooms identify where parking-related pressure is likely to increase in the next hour.

It transforms historical parking-incident records into:

* ranked patrol recommendations;
* confidence-aware enforcement actions;
* zone-level evidence and explanations;
* adaptive patrol allocation;
* an interactive command-centre dashboard.

> **Predict earlier. Explain clearly. Deploy smarter.**

---

## Overview

Traditional parking enforcement is reactive: a violation occurs, the incident is recorded, and officers respond later.

PARK-GUARD uses historical and recent incident patterns to forecast the next-hour parking-pressure proxy for 250-metre zones. The system then converts these forecasts into actionable patrol recommendations.

```text
Parking incident records
→ data cleaning and deduplication
→ 250 m hourly zone panel
→ feature engineering
→ next-hour pressure forecasting
→ confidence and action logic
→ adaptive patrol recommendations
→ interactive Command Centre
```

---

## Key Features

* Next-hour parking-pressure forecasting
* 250 m zone-level analysis
* Ranked patrol recommendations
* Adaptive patrol allocation
* Historical replay and simulated-live mode
* Interactive map with zone polygons
* Top 5, Top 10 and complete recommendation views
* Search and operational filters
* Confidence tiers and verification flags
* Evidence-based patrol actions
* Selected-zone details and 500 m coverage area
* Hypothetical intervention scenario simulator
* Peak Demo and Quiet Hour presets

---

## Patrol Actions

PARK-GUARD converts model forecasts into four operational actions:

* **Preventive patrol**
* **Active parking enforcement**
* **Targeted obstruction enforcement**
* **Verify before enforcement**

Low-confidence recommendations are marked for field verification before strong enforcement action.

---

## Dataset and Model

The modelling pipeline processes:

| Statistic                                  |     Value |
| ------------------------------------------ | --------: |
| Raw incident records                       |   298,450 |
| Incidents after conservative deduplication |   292,730 |
| Eligible 250 m analysis zones              |     1,163 |
| Hourly zone-panel rows                     | 4,214,712 |
| Generated patrol recommendations           |    15,021 |
| Date-partitioned frontend files            |        46 |

The final forecasting model is a **CatBoost model with 150 trees**.

It uses feature groups such as:

* recent incident pressure;
* short-term activity bursts;
* persistence across consecutive hours;
* hourly, daily and weekly recurrence;
* vehicle and offence composition;
* obstruction-related evidence;
* neighbouring-zone activity;
* observation quality and data confidence.

The model predicts a **next-hour incident-pressure proxy** derived from parking records.

---

## Evaluation Results

PARK-GUARD was evaluated using chronological train, validation and test periods and compared with a recent-24-hour prioritisation baseline.

| Metric              | PARK-GUARD | Baseline | Relative Improvement |
| ------------------- | ---------: | -------: | -------------------: |
| Pressure Capture@25 | **39.93%** |   29.28% |          **+36.37%** |
| Hotspot Recall@25   | **50.24%** |   37.30% |          **+34.69%** |
| NDCG@25             | **0.3834** |   0.2194 |          **+74.77%** |

### Spatial Holdout

The model was also evaluated on geographically unseen zones.

| Metric           | PARK-GUARD | Baseline |
| ---------------- | ---------: | -------: |
| Pressure Capture | **34.95%** |   25.75% |
| Hotspot Recall   | **44.65%** |   32.67% |

### Temporal Ablation

| Model                       | Pressure Capture |
| --------------------------- | ---------------: |
| Full model                  |       **38.79%** |
| Without temporal recurrence |           36.71% |
| Static heatmap-like model   |           34.97% |

The full model performs approximately **10.9% better than the static heatmap-like approach**.

---

## Adaptive Patrol Allocation

Instead of deploying the maximum patrol capacity every hour, PARK-GUARD uses a validation-selected threshold to deploy patrols only where predicted risk justifies intervention.

Compared with a fixed capacity of 25 patrols:

* **13.83 average patrols per hour**
* **44.7% fewer deployments**
* **95.04% of direct pressure capture retained**
* **97.93% of hotspot-area coverage retained**
* Approximately **22% of hours require no deployment**

---

## Command Centre

The web interface provides an operational workflow for reviewing model recommendations.

### Timeline Controls

Operators can:

* choose a historical date and target hour;
* move to the previous or next hour;
* replay recommendations automatically;
* select 0.5x, 1x or 2x playback speed;
* switch between simulated-live and historical modes;
* jump to Peak Demo or Quiet Hour.

### Recommendation Rail

Recommendations can be viewed as:

* Top 5
* Top 10
* All recommended zones

Available filters include:

* zone or grid ID;
* confidence tier;
* patrol action;
* obstruction evidence;
* verification requirement;
* current evidence.

The visual metric selector can emphasise:

* patrol priority;
* expected pressure;
* severe-hotspot probability;
* data confidence.

### Zone Details

Selecting a recommendation displays:

* priority score;
* expected next-hour pressure;
* severe-hotspot probability;
* confidence tier;
* patrol action;
* evidence and reason codes;
* the selected 250 m zone;
* a 500 m operational coverage area;
* hypothetical 30%, 60% and 90% intervention scenarios.

---

## Technology Stack

### Modelling and Data

* Python
* Pandas
* NumPy
* GeoPandas
* Scikit-learn
* CatBoost
* Shapely
* Parquet
* GeoJSON

### Web Application

* React
* Vite
* JavaScript
* Tailwind CSS
* shadcn/ui
* Recharts
* MapLibre GL JS
* MapTiler Cloud
* Vercel

---

## Project Structure

```text
.
├── input-data/             # Source model outputs used to build web data
├── notebooks/              # Kaggle modelling and evaluation notebooks
├── public/
│   └── data/               # Generated data loaded by the web application
├── scripts/                # Frontend data-preparation scripts
├── src/                    # React application source
├── .env.example            # Environment-variable template
├── package.json
├── requirements-data.txt
├── vercel.json
└── vite.config.js
```

---

## Modelling Notebooks

The [`notebooks/`](./notebooks) directory contains the Kaggle workflow used to create the model and operational recommendations.

| Notebook                                                                         | Purpose                                                                                |
| -------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| [`P1_Dataset_Audit.ipynb`](./notebooks/P1_Dataset_Audit.ipynb)                   | Audits the raw dataset, missing values, duplicates, timestamps and geographic coverage |
| [`P2_3.ipynb`](./notebooks/P2_3.ipynb)                                           | Performs preprocessing, deduplication, zone assignment and hourly-panel construction   |
| [`P6_Forecast_Features.ipynb`](./notebooks/P6_Forecast_Features.ipynb)           | Generates temporal, spatial, obstruction and confidence features                       |
| [`P4_Pressure_Forecasting.ipynb`](./notebooks/P4_Pressure_Forecasting.ipynb)     | Trains and evaluates the next-hour pressure-forecasting model                          |
| [`P5_Operational_Deployment.ipynb`](./notebooks/P5_Operational_Deployment.ipynb) | Converts forecasts into adaptive patrol recommendations and application-ready outputs  |

Recommended workflow:

```text
P1_Dataset_Audit
→ P2_3
→ P6_Forecast_Features
→ P4_Pressure_Forecasting
→ P5_Operational_Deployment
```

The notebooks were developed for Kaggle. Dataset paths may need to be updated when running them in another environment.

---

# Running the Project Locally

## Prerequisites

Install:

* [Git](https://git-scm.com/)
* [Node.js](https://nodejs.org/) and npm
* A MapTiler browser API key

Python 3 is required only when regenerating the frontend data.

---

## 1. Clone the Repository

```bash
git clone https://github.com/rkcoder101/Park-Guard.git
cd Park-Guard
```

---

## 2. Install Dependencies

```bash
npm install
```

---

## 3. Configure Environment Variables

Copy the example file.

### Linux or macOS

```bash
cp .env.example .env.local
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env.local
```

Add the following values to `.env.local`:

```env
VITE_MAPTILER_API_KEY=YOUR_MAPTILER_BROWSER_KEY
VITE_MAPTILER_STYLE_ID=streets-v4
VITE_DATA_BASE_URL=/data
```

| Variable                 | Description                                   |
| ------------------------ | --------------------------------------------- |
| `VITE_MAPTILER_API_KEY`  | Browser key used to load the MapTiler basemap |
| `VITE_MAPTILER_STYLE_ID` | MapTiler map style ID                         |
| `VITE_DATA_BASE_URL`     | Base path of the generated frontend data      |

Do not commit `.env.local`.

For local development, add `localhost` to the MapTiler key's allowed HTTP origins.

---

## 4. Start the Application

```bash
npm run dev
```

Vite normally starts the application at:

```text
http://localhost:5173
```

Available routes:

| Route             | Description                                     |
| ----------------- | ----------------------------------------------- |
| `/`               | Landing page                                    |
| `/command-center` | Interactive Command Centre                      |
| `/about`          | Methodology, safeguards and project information |

Open:

```text
http://localhost:5173/command-center
```

Restart the development server after changing environment variables.

---

## Production Build

Run linting:

```bash
npm run lint
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

The generated files are written to:

```text
dist/
```

---

## Frontend Data

The application-ready data is stored in:

```text
public/data/
```

It includes:

* 1,163 analysis-zone polygons;
* date-partitioned recommendation files;
* schedule and metadata files;
* evaluation summaries;
* model-generated operational fields.

The application loads recommendation files by date, reducing initial loading time and browser memory usage.

---

## Regenerating Frontend Data

Run this step only when the modelling outputs have changed.

### 1. Create a Python Environment

```bash
python3 -m venv .venv
```

Activate it on Linux or macOS:

```bash
source .venv/bin/activate
```

Activate it on Windows PowerShell:

```powershell
.venv\Scripts\Activate.ps1
```

### 2. Install Data Dependencies

```bash
pip install -r requirements-data.txt
```

### 3. Prepare Input Files

Place the required model outputs and geospatial files inside:

```text
input-data/
```

### 4. Generate Web Assets

```bash
python scripts/prepare_web_data.py
```

The generated files are written to:

```text
public/data/
```

Validate the updated data:

```bash
npm run lint
npm run build
npm run dev
```

---

## Deploying to Vercel

Recommended Vercel settings:

```text
Framework Preset: Vite
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

Add these environment variables in:

```text
Vercel Project
→ Settings
→ Environment Variables
```

```env
VITE_MAPTILER_API_KEY=YOUR_MAPTILER_BROWSER_KEY
VITE_MAPTILER_STYLE_ID=streets-v4
VITE_DATA_BASE_URL=/data
```

Then deploy:

```bash
npx vercel --prod
```

For a public deployment:

* add the Vercel hostname to the MapTiler key's allowed origins;
* ensure Vercel Deployment Protection is disabled;
* verify the landing page and `/command-center` route;
* redeploy after changing any Vite environment variable.

---

## Verification Checklist

After setup, verify that:

* the landing page loads;
* the Command Centre loads;
* the historical timeline works;
* Peak Demo and Quiet Hour work;
* filters update the recommendation list;
* selecting a recommendation updates the map and details;
* `/data/zones.geojson` returns successfully;
* the MapTiler basemap loads;
* the browser console contains no application errors.

---

## Responsible Use

PARK-GUARD is designed as a human-in-the-loop decision-support tool.

* Human officers retain responsibility for enforcement decisions.
* No fines or penalties are issued automatically.
* Low-confidence recommendations require field verification.
* The model predicts an incident-pressure proxy, not direct road speed.
* Scenario estimates are hypothetical and should not be interpreted as causal guarantees.
* Current results are based on historical evaluation.

