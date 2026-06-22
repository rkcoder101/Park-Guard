import { useCommandCenter } from "../../context/useCommandCenter.js";

export function CapacityControl() {
  const { actions, capacity, recommendations } = useCommandCenter();
  const total = recommendations.length;
  const options = [
    { label: "Top 5", value: 5 },
    { label: "Top 10", value: 10 },
    { label: `All recommended (${total})`, value: "all" },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          className={[
            "rounded-md border px-3 py-2 text-sm font-semibold transition-colors",
            capacity === option.value
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-secondary text-secondary-foreground hover:bg-secondary/80",
          ].join(" ")}
          key={option.label}
          onClick={() => actions.setCapacity(option.value)}
          type="button"
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
