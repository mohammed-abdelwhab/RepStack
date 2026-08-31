import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GymTrackerProvider } from "./context/GymTrackerContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GymTrackerProvider>
      <App />
    </GymTrackerProvider>
  </StrictMode>,
);
