import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Читаем .env из корня монорепо,
  // чтобы держать все переменные в одном месте.
  envDir: "../../",
});
