import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

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
  plugins: [react(), securityHeaders()],
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
