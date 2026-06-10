# HarpLayout (React)

A standalone React + TypeScript rewrite of HarpLayout. It renders harmonica
tablature — natural notes, bends, overbends/overdraws, and interval categories —
for any supported tuning, key, and playing position.

Unlike the original Perl app, **all the music logic runs in the browser**. The
modules under `src/music/` are a faithful 1:1 port of the Perl
`HarpLayout::*` modules (`MusicLogic`, `CircleOfFifths`, `Harmonica`,
`Harmonica::Table`, `Harmonica::Note`, `Harmonica::Tuning`), so there is no
backend to run.

## Run

```bash
cd react
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # type-check + production bundle into dist/
npm run test     # Vitest: unit tests + Perl cross-check
```

## How it works

- `src/music/` — the ported music engine. `buildHarp()` in `harmonica.ts` is the
  single entry point: given `{ tuning, harpKey, songKey, position, calculate }` it
  resolves the unknown value (via the circle of fifths) and returns the full note
  grid plus display rows.
- `src/components/` — the UI: the three key/position calculators, the harp table,
  view-option toggles, and the legend.
- `src/state/useHarpState.ts` — holds form state and derives the grid with
  `useMemo`. The six view toggles are pure render-time filters (they never trigger
  a recompute), matching the original app's client-side behaviour.

## Verifying against the Perl app

`src/music/crosscheck.test.ts` compares the TS engine against reference output
captured from the original Perl modules (`scripts/perl_fixture.txt`), across every
tuning, several keys/positions, and all three calculate modes.

To regenerate the fixture (requires the Perl stack running via `docker compose up`
from the repo root):

```bash
node scripts/gen_cases.mjs > /tmp/harp_cases.txt
docker compose -f ../docker-compose.yml cp scripts/dump_grid_batch.pl hlapp:/tmp/dump_grid_batch.pl
docker compose -f ../docker-compose.yml exec -T -w /app/perl hlapp \
  carton exec perl /tmp/dump_grid_batch.pl < /tmp/harp_cases.txt > scripts/perl_fixture.txt
```
