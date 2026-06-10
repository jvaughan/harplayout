# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

HarpLayout renders harmonica tablature. Given a harp tuning, key, and playing position, it calculates and displays all available notes (natural, bends, overbends) across the harmonica's holes in an interactive table.

There are **two implementations** in this repo:

- **Perl app** (`hlapp/`, `nginx/`) — the original Template Toolkit / Starman / nginx stack, served via Docker. Computes the note grid server-side.
- **React app** (`react/`) — a standalone Vite + React + TypeScript rewrite. The music logic is a faithful 1:1 port of the Perl modules, so it runs **entirely client-side** (no backend). See [React app](#react-app-react) below.

The two are kept behaviorally identical: `react/src/music/crosscheck.test.ts` diffs the TS output against reference output captured from the Perl modules.

## Running the App

```bash
# Start the full stack (nginx + Perl app)
docker compose up

# Rebuild after code changes
docker compose up --build
```

The app is served at `http://localhost:8222`.

The Perl app runs on Starman (port 9000 inside Docker); nginx proxies `/` and `/table` to it and serves static assets directly.

## Architecture

### Two-container stack

- **`hlapp/`** — Perl PSGI app built on `CGI::Application`. Dependencies managed with `Carton` (see `hlapp/app/perl/cpanfile`).
- **`nginx/`** — Reverse proxy that also serves static files (CSS, JS) from its own image. Static assets live in `nginx/css/` and `nginx/js/`.

### Perl module hierarchy

```
HarpLayout::Webapp              # CGI::Application subclass; single runmode (showHarp)
HarpLayout::Harmonica           # Core model: builds blow/draw/bend/overbend note grid
HarpLayout::Harmonica::Table    # Extends Harmonica; organises notes into a 2D table for templates
HarpLayout::Harmonica::Tuning   # Tuning registry: maps tuning name → blow/draw interval arrays
HarpLayout::Harmonica::Note     # Single note object; overloads +/-/==/</> using intervals
HarpLayout::MusicLogic          # Interval arithmetic, note-from-key lookups, interval categories
HarpLayout::MusicLogic::CircleOfFifths  # Circle-of-fifths traversal used for position/key maths
```

### Key concepts

- **Intervals** are represented as strings like `1`, `b3`, `5`, `b7`. Semitone comparisons convert them to numeric values (e.g. `b3` → `2.5`) internally in `MusicLogic`.
- **Position** is the harmonica playing position (1st = straight, 2nd = cross, etc.). Positions relate harp key to song key via circle-of-fifths steps.
- **`label_position`** on a `Tuning` object indicates how the tuning is conventionally labelled. Most tunings are labelled in 1st position (default); some (e.g. Natural Minor, Dorian) use 2nd position.
- Bends are calculated by stepping the natural note one semitone closer to the opposing reed's natural note, stopping one semitone away. Overbends are one semitone above the opposing reed's natural note.

### Adding a new tuning

The tuning registry is duplicated across both implementations — add the entry to **both**:

- Perl: the `%tunings` hash in [hlapp/app/perl/HarpLayout/Harmonica/Tuning.pm](hlapp/app/perl/HarpLayout/Harmonica/Tuning.pm). Each entry needs `blow` and `draw` array refs of first-position interval strings, and an optional `label_position` integer.
- React: the `TUNINGS` map in [react/src/music/tunings.ts](react/src/music/tunings.ts), with the same `blow`/`draw` arrays and optional `labelPosition`.

After adding it, regenerate the cross-check fixture (see [React app](#react-app-react)) so the new tuning is verified against the Perl output.

### Templates

Templates use Template Toolkit, located in `hlapp/app/templates/`. The main entry point is `main.tmpl`; the AJAX partial is `inc/form_and_harp.tmpl`. The harp table rendering is split across `inc/harptable.tmpl`, `inc/harptable/harprow.tmpl`, and `inc/harptable/notecell.tmpl`.

### Frontend

`nginx/js/harplayout.js` uses jQuery for AJAX form reloads and Scriptaculous (`protoculous.js`) for fade effects. Form changes call `handleChange()`, which either toggles CSS visibility client-side (for show/hide options) or calls `reloadFormAndHarp()` to fetch the `inc/form_and_harp` partial via AJAX.

## React app (`react/`)

A standalone Vite + React + TypeScript rewrite. All the music logic runs in the browser — there is no backend and it is independent of the Perl stack.

### Running

```bash
cd react
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + static bundle into react/dist/
npm run test     # Vitest: unit tests + Perl cross-check
```

The build output (`react/dist/`) is a static site, deployable to any static host.

### Deploying & previewing (Cloudflare Workers)

The React app deploys as a **Cloudflare Workers static-assets project** (not Pages),
configured by [react/wrangler.jsonc](react/wrangler.jsonc) (`assets.directory = ./dist`).
Two deploy paths exist:

- **GitHub integration (primary).** Cloudflare's Workers Builds watches the repo and,
  on push, runs the build and uploads a new *version*. Production is promoted manually.
  The build command in the Cloudflare dashboard is `npm run build:ci` (lint + test +
  build), so the deploy is gated by the same checks CI runs.
- **Wrangler CLI (ad hoc).** From `react/`: `npm run build && npx wrangler versions upload`
  uploads a version without routing production traffic; `npx wrangler versions deploy`
  promotes a version to production.

**Previewing before promoting.** `preview_urls: true` in `wrangler.jsonc` gives every
uploaded version its own preview URL (production traffic unaffected). Find it by:

- **CLI:** `npx wrangler versions upload` prints `Version Preview URL` directly; or
  `npx wrangler versions list` shows all versions (the `Source` field shows the git
  commit for GitHub-integration builds).
- **Deterministic URL:** `https://<first-8-chars-of-version-id>-harplayout-react.jon-vaughan.workers.dev`.
- **GitHub:** Cloudflare's app reports build status on the commit/PR, commenting the
  preview URL on PRs.
- **Dashboard:** Worker → Deployments/Versions → pick a version → Preview URL.

CI ([.github/workflows/react-ci.yml](.github/workflows/react-ci.yml)) runs `build:ci` on
pushes/PRs touching `react/**`, but is independent of (and does not gate) the Cloudflare
deploy — Cloudflare's own build command is the gate.

**Security headers / CSP.** The `securityHeaders` Vite plugin in
[react/vite.config.ts](react/vite.config.ts) writes `dist/_headers` at build time —
Cloudflare Workers static assets apply `_headers` from the assets root. The CSP is strict
(`default-src 'self'`; the site has no external origins). The inline `<script>` in
`index.html` (anti-flash theme bootstrap) is permitted via a **sha256 hash computed from
the emitted `index.html` on every build**, so it never goes stale — don't hardcode it.
Inline `<style>` blocks would be hashed the same way. `dist/_headers` is a build artifact
(gitignored); only `vite.config.ts` is the source. After deploying, sanity-check with
`curl -sI <url> | grep -i content-security-policy` and watch the browser console for CSP
violations.

**PWA (installable + offline).** `VitePWA` in [react/vite.config.ts](react/vite.config.ts)
emits a service worker (Workbox, `registerType: "autoUpdate"`) and manifest; it's registered
from [react/src/main.tsx](react/src/main.tsx) (not an injected inline script, to keep the CSP
clean). Icons come from `public/favicon.svg` via `npm run gen:icons` (sharp) — the PNGs are
**committed** (don't move generation into the build; sharp is a native dep). Two non-obvious,
load-bearing details:

- **Precache `/`, not `/index.html`.** Cloudflare canonicalises `/index.html` → `/` (a 307).
  Workbox rejects redirects during SW install, so precaching `/index.html` makes the SW fail
  to activate — and **Android Chrome won't offer "Install app" without an active SW** (desktop
  Chrome installs without one, which masks the failure). The `workbox.manifestTransforms` +
  `navigateFallback: "/"` in `vite.config.ts` precache the clean `/` URL instead. Do **not**
  revert to precaching `index.html`.
- The CSP already allows the SW (`worker-src 'self'`, `manifest-src 'self'`).

Verify after deploy: `curl -sI <url>/ | head -1` is 200, and DevTools → Application → Service
Workers shows it **activated** (no precache error).

### Music engine (`react/src/music/`)

A faithful 1:1 port of the Perl modules; keep the two in sync when changing logic.

| TypeScript | Ports from |
| --- | --- |
| `circleOfFifths.ts` | `MusicLogic::CircleOfFifths` |
| `musicLogic.ts` | `MusicLogic` (interval arithmetic, note lookups, categories) |
| `tunings.ts` | `Harmonica::Tuning` (the `TUNINGS` registry) |
| `note.ts` | `Harmonica::Note` (the `+`/`-`/`==`/`<`/`>` overloads become pure helpers keyed on `firstPosInterval`) |
| `harmonica.ts` | `Harmonica` + `Harmonica::Table` |

`buildHarp({ tuning, harpKey, songKey, position, calculate })` in `harmonica.ts` is the single entry point: it resolves the unknown value (`calculate` is `"song_key"`, `"harp_key"`, or `"position"`) and returns the full note grid plus the display rows (`blowRows` reversed, `drawRows` as-is, `holeNums`).

Subtleties that must match Perl exactly: the 12-element chromatic ring built from the circle-of-fifths interval keys; the windowed `intervalGt` comparison (`BOUNDARY = 7`); and Perl's negative-array-index wrap in interval subtraction (handled explicitly in `musicLogic.ts`).

### UI (`react/src/components/`, `react/src/state/`)

- `useHarpState.ts` holds form state and derives the grid with `useMemo`. The six view toggles (bends / overbends / unnecessary OBs / note names / intervals / interval categories) are **pure render-time filters** — they never recompute the grid, mirroring the original app's client-side show/hide behavior.
- `useTheme.ts` + `ThemeToggle.tsx` provide a light/dark switcher; the theme is a `data-theme` attribute on `<html>`, persisted to `localStorage`, defaulting to the OS `prefers-color-scheme`. An inline script in `index.html` sets it before first paint to avoid a flash. All colors are CSS variables in `src/styles/app.css`.
- Components: `CalculatorBar` (the three key/position calculators), `HarpTable` + `NoteCell`, `ViewOptions`, `Legend`.

### Cross-check against the Perl app

`react/src/music/crosscheck.test.ts` compares `buildHarp` output against `react/scripts/perl_fixture.txt` — reference output captured from the Perl modules across every tuning, several keys/positions, and all three calculate modes. The fixture is committed so the test runs without Docker.

To regenerate the fixture (requires the Perl stack up via `docker compose up` from the repo root):

```bash
cd react
node scripts/gen_cases.mjs > /tmp/harp_cases.txt
docker compose -f ../docker-compose.yml cp scripts/dump_grid_batch.pl hlapp:/tmp/dump_grid_batch.pl
docker compose -f ../docker-compose.yml exec -T -w /app/perl hlapp \
  carton exec perl /tmp/dump_grid_batch.pl < /tmp/harp_cases.txt > scripts/perl_fixture.txt
```
