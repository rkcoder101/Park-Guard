# PARK-GUARD Validated Evaluation Results

## Approved headline claims

These claims may appear on the landing page, README, presentation, and product description when accompanied by historical-evaluation context.

### Frozen next-hour forecast

At K=25 on the held-out test period:

- Pressure capture: **39.93%**
- Recent-24-hour baseline pressure capture: **29.28%**
- Relative improvement: **36.37%**

- Hotspot recall at threshold 8: **50.24%**
- Baseline hotspot recall: **37.30%**
- Relative improvement: **34.69%**

- NDCG: **0.3834**
- Baseline NDCG: **0.2194**
- Relative improvement: **74.77%**

### Geographic holdout

On zones excluded from training:

- Pressure capture: **34.95%**
- Baseline: **25.75%**
- Relative improvement: **35.73%**

- Hotspot recall: **44.65%**
- Baseline: **32.67%**
- Relative improvement: **36.67%**

### Temporal ablation

- Full-model pressure capture in the ablation experiment: **38.79%**
- Static heatmap-like model: **34.97%**
- Relative improvement: **10.93%**

- No-temporal-recurrence model: **36.71%**
- Full model relative improvement: **5.65%**

The ablation full-model value differs slightly from the frozen official value because the ablation models were retrained separately. Do not replace the official frozen result with the ablation value.

### Adaptive patrol deployment

At nominal capacity 25:

- Fixed deployment: **25 patrols/hour**
- Adaptive deployment: **13.83 patrols/hour**
- Average reduction: **44.70%**

Adaptive deployment retained:

- **95.04%** of fixed-capacity direct pressure capture
- **97.93%** of fixed-capacity area hotspot coverage

Approximately **22.06%** of test hours required no deployment.

### Confidence audit

Maximum absolute calibration bias across test confidence bands:

```text
0.0015
```

### Scenario analysis

Mean local gain per test hour under the 60% scenario:

```text
15.3103 incident-pressure units
```

This is a hypothetical local suppression scenario, not a causal estimate.

---

## Approved compact landing copy

```text
39.93%
Pressure captured within the top 25 ranked zones

50.24%
Severe hotspots identified within the top 25

44.7%
Fewer average patrol deployments through adaptive dispatch
```

Caption:

```text
Evaluated on the held-out historical test period.
```

---

## Claims that are not allowed

Do not state:

- `PARK-GUARD reduces congestion by 60%`
- `95% accurate`
- `50% prediction accuracy`
- `Prevents 15 incidents per hour`
- `Real-time Bengaluru congestion detection`
- `Causal enforcement benefit`
- `Learns how congestion propagates`
- `Guarantees improved traffic flow`
- `Identifies offenders`
- `Automatically enforces parking law`

---

## Product caveats

Always preserve these distinctions:

1. Incident pressure is not direct traffic speed.
2. Hotspot threshold 8 means at least eight next-hour incident records in a zone.
3. Scenario values are hypothetical.
4. Confidence describes observation reliability, not certainty that an offence exists.
5. Neighbourhood activity supports ranking and coverage, not propagation.
6. The system supports human decisions and does not issue penalties.
