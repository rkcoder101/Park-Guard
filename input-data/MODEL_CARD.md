# PARK-GUARD Model Card

## Intended use

PARK-GUARD forecasts parking-incident pressure for 250 m zones one hour ahead and recommends up to 25 patrol locations per hour.

It is intended as a decision-support system for traffic-police and smart-city control rooms.

## Core configuration

- Spatial unit: 250 m grid
- Temporal unit: 1 hour
- Primary hotspot definition: at least 8 incidents
- Dispatch threshold: 0.588658
- Patrol balancing alpha: 0.60
- Patrol coverage radius: 500 m
- Low-confidence threshold: 0.755336
- High-confidence threshold: 0.907102

## Main test results

- Pressure capture at K=25: 0.3993
- Recent-24-hour baseline pressure capture: 0.2928
- Hotspot recall at K=25: 0.5024
- Recent-24-hour baseline hotspot recall: 0.3730
- NDCG at K=25: 0.3834

## Geographic generalization

The spatial-holdout model achieved pressure capture of 0.3495 and hotspot recall of 0.4465 on zones excluded from training.

## Adaptive deployment

At nominal capacity 25, adaptive dispatch deployed an average of 13.83 patrols per hour.

It retained 95.04% of direct pressure capture and 97.93% of area hotspot coverage.

## Limitations and safeguards

1. Incident reports are a proxy for parking pressure, not direct traffic-speed or congestion measurements.
2. Enforcement-benefit fields are hypothetical suppression scenarios, not causal treatment-effect estimates.
3. Neighbourhood exposure is used for ranking and patrol coverage; it must not be described as learned congestion propagation.
4. The learned directional influence graph was rejected after failing holdout validation.
5. Low-confidence and cold-start recommendations require on-site verification.
6. The system must not automatically issue penalties or infer legal guilt.
7. Reporting intensity varies geographically and may reflect enforcement practices as well as underlying parking behaviour.
