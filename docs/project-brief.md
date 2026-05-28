# macro-tracker — project brief

## What this project is

Personal single-page web app ("MACRO_LOG") for tracking Ross's daily macros and exercise. Not a client project, not part of the R&R portfolio — a personal tool optimized for fast mobile entry and a clean log of food and exercise, written to a Google Sheet for downstream analysis.

A static `index.html` renders the UI; two Netlify Functions handle nutrition analysis and logging; entries flow out to a Google Sheet via a Pabbly webhook.

## How it's structured

- **Frontend:** single static `index.html` at the repo root (~32 KB). No framework, no build step. Inline CSS, inline JS, vanilla. Fonts: Space Mono + DM Sans via Google Fonts. Dark theme. Styling tokens live at `:root`.
- **Backend:** two Netlify Functions in `netlify/functions/`:
  - `analyze.mjs` — nutrition analysis endpoint (LLM call to estimate macros from a free-text food description).
  - `log.mjs` — write endpoint; posts the entry to the Pabbly webhook, which forwards to a Google Sheet.
- **Logging path:** browser → `log.mjs` → Pabbly webhook → Google Sheet. Exercise events used to go through a Google Apps Script; moved to Pabbly in commit `90994c9`.
- **Hosting / deploy:** Netlify, site ID `3d3edbd8-a28c-46fe-a5ba-bcedd59fd17d`. Auto-deploys on push to `main` via `.github/workflows/deploy.yml`.
- **Repo:** `github.com/ross1073/macro-tracker`.

### Key files

- `index.html` — the entire frontend. Mode toggle, quick-log buttons, meal indicator, input toggle (text vs other).
- `netlify/functions/analyze.mjs` — nutrition analysis endpoint.
- `netlify/functions/log.mjs` — write endpoint, hits Pabbly webhook.
- `.github/workflows/deploy.yml` — Netlify auto-deploy on push to main.
- `CLAUDE.md` — project conventions and "don't do this" notes.

## Conventions

- **"Done" means live on the production Netlify URL** after a successful build, not just merged to `main`. Verify the deploy.
- Meal type **auto-detects from time of day** (commit `4aa2298`). Do not reintroduce the manual meal picker.
- The "Today's Progress" coach panel was deliberately **removed** (commit `f37c9e6`). Do not add it back without asking.
- **No build step** — edits go straight into `index.html`. Keep it that way unless there's a real reason to introduce a bundler.
- Personal project; conversational, low-ceremony. No tests, no CI gates beyond the deploy workflow.
- Deliberately not here: no framework, no bundler, no tests, no design system beyond the CSS tokens, no analytics, no auth (single-user).

## Memory system

The user profile (`~/.claude/user.md`), project brief, and the two most recent daily notes from `docs/memory/` auto-load into context via a SessionStart hook (`.claude/hooks/session-start-load-context.sh`); `docs/stage-current.md` loads too when present. Daily notes are written by the SessionEnd memory-keeper agent (`.claude/agents/memory-keeper.md`) — it appends a timestamped session block to `docs/memory/<YYYY-MM-DD>.md`, never overwriting prior days. The retired `docs/status.md` rolling file was migrated into the first dated note. `/audit-brief` is the manual drift check that compares the brief against the codebase and writes a severity-tagged findings file under `docs/audits/`.
