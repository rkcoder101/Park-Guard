import { cn } from "../../lib/utils.js";

const variants = {
  cyan: "border-operational-cyan/40 bg-operational-cyan/12 text-cyan-100",
  amber: "border-operational-amber/40 bg-operational-amber/12 text-amber-100",
  muted: "border-border bg-muted text-muted-foreground",
};

export function Badge({ children, className, variant = "muted" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
