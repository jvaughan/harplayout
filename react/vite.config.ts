import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Explicit (matches Vite's default): ship syntax that's been interoperable
    // across all major browsers for ~30 months. Auto-advances as browsers age.
    // Controls emitted syntax only — not runtime API polyfills.
    target: "baseline-widely-available",
  },
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./src/test/setup.ts"],
  },
});
