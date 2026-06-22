import { SiteHeader } from "./SiteHeader.jsx";
import { cn } from "../../lib/utils.js";

export function PageShell({ action, children, className }) {
  return (
    <>
      <SiteHeader action={action} />
      <main className={cn("mx-auto w-full max-w-7xl px-5 py-8", className)}>
        {children}
      </main>
    </>
  );
}
