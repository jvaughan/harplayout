# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

HarpLayout is a Perl web application that renders harmonica tablature. Given a harp tuning, key, and playing position, it calculates and displays all available notes (natural, bends, overbends) across the harmonica's holes in an interactive HTML table.

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

Add an entry to the `%tunings` hash in [hlapp/app/perl/HarpLayout/Harmonica/Tuning.pm](hlapp/app/perl/HarpLayout/Harmonica/Tuning.pm). Each entry needs `blow` and `draw` array refs of first-position interval strings, and an optional `label_position` integer.

### Templates

Templates use Template Toolkit, located in `hlapp/app/templates/`. The main entry point is `main.tmpl`; the AJAX partial is `inc/form_and_harp.tmpl`. The harp table rendering is split across `inc/harptable.tmpl`, `inc/harptable/harprow.tmpl`, and `inc/harptable/notecell.tmpl`.

### Frontend

`nginx/js/harplayout.js` uses jQuery for AJAX form reloads and Scriptaculous (`protoculous.js`) for fade effects. Form changes call `handleChange()`, which either toggles CSS visibility client-side (for show/hide options) or calls `reloadFormAndHarp()` to fetch the `inc/form_and_harp` partial via AJAX.
