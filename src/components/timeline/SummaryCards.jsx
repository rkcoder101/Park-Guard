import { Panel } from "../common/Panel.jsx";
import { useCommandCenter } from "../../context/useCommandCenter.js";
import { formatPercent, formatScore } from "../../lib/formatting/dateTime.js";

export function SummaryCards() {
  const { selectedHour, visibleRecommendations } = useCommandCenter();
  const highestHotspot = Math.max(
    ...visibleRecommendations.map(
      (recommendation) => recommendation.severeHotspotProbability,
    ),
    0,
  );
  const meanConfidence =
    visibleRecommendations.length > 0
      ? visibleRecommendations.reduce(
          (sum, recommendation) => sum + recommendation.dataConfidence,
          0,
        ) / visibleRecommendations.length
      : null;
  const verificationCount = visibleRecommendations.filter(
    (recommendation) => recommendation.verificationRequired,
  ).length;

  const cards = [
    {
      label: "Recommended patrols",
      value: selectedHour ? selectedHour.recommendedPatrols : "N/A",
      note: "Adaptive count for selected hour",
    },
    {
      label: "Highest severe-hotspot probability",
      value: selectedHour ? formatPercent(highestHotspot, 1) : "N/A",
      note: "Within current display subset",
    },
    {
      label: "Mean selected data confidence",
      value: meanConfidence == null ? "N/A" : formatPercent(meanConfidence, 0),
      note: "Within current display subset",
    },
    {
      label: "Zones requiring verification",
      value: formatScore(verificationCount, 0),
      note: "Within current display subset",
    },
  ];

  return (
    <section className="grid gap-3 md:grid-cols-4">
      {cards.map((card) => (
        <Panel className="p-4" key={card.label}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {card.label}
          </p>
          <p className="tabular mt-3 text-2xl font-black text-foreground">
            {card.value}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">{card.note}</p>
        </Panel>
      ))}
    </section>
  );
}
