import { cn } from "../../lib/utils.js";

export function Panel({ children, className }) {
  return (
    <section
      className={cn(
        "rounded-lg border border-border bg-card/88 p-5 shadow-panel",
        className,
      )}
    >
      {children}
    </section>
  );
}
