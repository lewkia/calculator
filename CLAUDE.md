# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A single-page calculator web app built with plain HTML, CSS, and JavaScript — no build step, no dependencies.

## Running locally

Open `index.html` directly in a browser, or serve it with any static file server:

```bash
npx serve .          # serves on http://localhost:3000
python -m http.server # serves on http://localhost:8000
```

## Docker

```bash
docker build -t calculator .
docker run -p 8080:8080 calculator
# open http://localhost:8080
```

## Architecture

All logic lives in three files:

- `index.html` — markup and button `data-action` / `data-value` attributes that drive behavior
- `style.css` — dark theme, CSS grid button layout, operator active-state styling
- `app.js` — calculator state machine (`state` object) with a single event-delegated click listener on `.buttons` and a `keydown` listener for keyboard support

The `state` object tracks: `current` (display value), `previous` (left-hand operand), `operator`, `waitingForOperand`, and `justEvaluated`. Floating-point results are cleaned via `toPrecision(12)`.

`nginx.conf` overrides the default nginx config to listen on port 8080.
