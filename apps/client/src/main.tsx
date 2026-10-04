import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./app/App";

import { preloadSounds } from "./utils/sounds";

import "./styles/index.scss";

preloadSounds();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
