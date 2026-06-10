import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// Generate dist/_headers (security headers for the Cloudflare Workers static
// deploy) after the build. The CSP is strict — the site is fully self-contained,
// so everything is 'self'. Any inline <script>/<style> in the emitted index.html
// is allowed via its sha256 hash, computed here from the actual built output so
// it never goes stale. https://developers.cloudflare.com/workers/static-assets/headers/
function securityHeaders(): Plugin {
  let outDir = "dist";
  let root = process.cwd();
  const sha256 = (s: string) =>
    `'sha256-${createHash("sha256").update(s, "utf8").digest("base64")}'`;

  return {
    name: "security-headers",
    apply: "build",
    configResolved(cfg) {
      outDir = cfg.build.outDir;
      root = cfg.root;
    },
    closeBundle() {
      const html = readFileSync(join(root, outDir, "index.html"), "utf8");
      // Hash inline scripts (those without a src=) and inline styles.
      const hashesOf = (re: RegExp) =>
        [...html.matchAll(re)].map((m) => sha256(m[1]));
      const scriptSrc = [
        "'self'",
        ...hashesOf(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g),
      ].join(" ");
      const styleSrc = [
        "'self'",
        ...hashesOf(/<style[^>]*>([\s\S]*?)<\/style>/g),
      ].join(" ");

      const csp = [
        "default-src 'self'",
        `script-src ${scriptSrc}`,
        `style-src ${styleSrc}`,
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "manifest-src 'self'",
        "worker-src 'self'", // explicit: the PWA service worker
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ].join("; ");

      const headers = `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  X-Frame-Options: DENY
  Permissions-Policy: accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
`;
      writeFileSync(join(root, outDir, "_headers"), headers);
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // Silent auto-update: a new deploy's service worker activates on next load.
      registerType: "autoUpdate",
      // We register manually from main.tsx (no injected inline script) so the
      // strict CSP stays clean.
      injectRegister: null,
      includeAssets: ["favicon.svg", "apple-touch-icon.png"],
      manifest: {
        id: "/",
        name: "HarpLayout",
        short_name: "HarpLayout",
        description:
          "Harmonica tablature: natural notes, bends and overbends for any tuning, key and position.",
        theme_color: "#0f1419",
        background_color: "#0f1419",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
      // Fully static app: precache everything for complete offline support.
      workbox: {
        globPatterns: ["**/*.{js,css,html,svg,png,ico,webmanifest}"],
        // The host canonicalises /index.html -> / (a 307). Precache the clean
        // "/" URL instead so SW install gets a 200, and route offline
        // navigations to it — keeping the clean-URL redirect intact.
        navigateFallback: "/",
        manifestTransforms: [
          (entries) => ({
            manifest: entries.map((e) =>
              e.url === "index.html" ? { ...e, url: "/" } : e,
            ),
          }),
        ],
      },
    }),
    // securityHeaders runs last so it hashes the final emitted index.html.
    securityHeaders(),
  ],
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
