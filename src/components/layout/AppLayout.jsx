import { Outlet } from "react-router-dom";

export function AppLayout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_20%_-10%,hsl(var(--accent)/0.45),transparent_32rem),linear-gradient(180deg,hsl(var(--background)),hsl(218_58%_5%))]">
      <Outlet />
    </div>
  );
}
