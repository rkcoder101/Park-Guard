import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { AboutPage } from "../pages/AboutPage.jsx";
import { CommandCenterPage } from "../pages/CommandCenterPage.jsx";
import { LandingPage } from "../pages/LandingPage.jsx";

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="command-center" element={<CommandCenterPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Route>
    </Routes>
  );
}
