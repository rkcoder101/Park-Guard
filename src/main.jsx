import React from "react";
import ReactDOM from "react-dom/client";
import { AppProviders } from "./app/AppProviders.jsx";
import { AppRouter } from "./app/router.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>,
);
