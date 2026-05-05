# macro-tracker — project brief

Personal single-page web app ("MACRO_LOG") for tracking daily macros and exercise. Static `index.html` plus two Netlify Functions; entries get logged to a Google Sheet via a Pabbly webhook.

## Purpose

Personal tool — Ross's own macro and exercise tracker. Not a client project, not part of the R&R portfolio. Optimized for fast mobile entry and a clean log of what was eaten and what exercise happened, written to a Google Sheet for downstream analysis.

## Stack

- **Frontend:** single static `index.html` at the repo root (~32 KB). No framework, no build step. Inline CSS, inline JS. Vanilla. Fonts: Space Mono + DM Sans via Google Fonts. Dark theme.
- **Backend:** two Netlify Functions in `netlify/functions/`:
  - `analyze.mjs` — nutrition analysis (likely an LLM call to estimate macros from a free-text food description).
  - `log.mjs` — writes the entry to the Pabbly webhook, which forwards to a Google Sheet.
- **Logging path:** browser → `log.mjs` → Pabbly webhook → Google Sheet. Exercise events used to go through a Google Apps Script; moved to Pabbly in commit `90994c9`.
- **Hosting:** Netlify, site ID `3d3edbd8-a28c-46fe-a5ba-bcedd59fd17d`. Auto-deploys on push to `main` via `.github/workflows/deploy.yml`.
- **Repo:** `github.com/ross1073/macro-tracker`.

## Key files

- `index.html` — the entire frontend. Mode toggle, quick-log buttons, meal indicator, input toggle (text vs other), styling tokens at `:root`.
- `netlify/functions/analyze.mjs` — nutrition analysis endpoint.
- `netlify/functions/log.mjs` — write endpoint, hits Pabbly webhook.
- `.github/workflows/deploy.yml` — Netlify auto-deploy on push to main.
- `CLAUDE.md` — project conventions and "don't do this" notes.

## Conventions

- "Done" means the change is live on the production Netlify URL after a successful build, not just merged to `main`. Verify the deploy.
- Meal type **auto-detects from time of day** (commit `4aa2298`). Do not reintroduce the manual meal picker.
- The "Today's Progress" coach panel was deliberately **removed** (commit `f37c9e6`). Do not add it back without asking.
- No build step — edits go straight into `index.html`. Keep it that way unless there's a real reason to introduce a bundler.
- Personal project; conversational, low-ceremony. No tests, no CI gates beyond the deploy workflow.

## What's deliberately not here

- No framework. No bundler. No tests. No design system beyond the CSS tokens at the top of `index.html`. No analytics. No auth — single-user.
