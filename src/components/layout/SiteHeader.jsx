import { Link, NavLink } from "react-router-dom";
import { Button } from "../common/Button.jsx";

const navLinkClass = ({ isActive }) =>
  [
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted/70 hover:text-foreground",
  ].join(" ");

export function SiteHeader({ action }) {
  return (
    <header className="sticky top-0 z-20 border-b border-border/80 bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-5">
        <Link className="text-base font-black tracking-wide text-foreground" to="/">
          PARK-GUARD
        </Link>
        <nav className="flex items-center gap-1">
          <NavLink className={navLinkClass} to="/">
            Overview
          </NavLink>
          <NavLink className={navLinkClass} to="/command-center">
            Command Centre
          </NavLink>
          <NavLink className={navLinkClass} to="/about">
            About
          </NavLink>
        </nav>
        <div className="hidden sm:block">
          {action ?? (
            <Button asChild size="sm" variant="secondary">
              <Link to="/command-center">Open Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
