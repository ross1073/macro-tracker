# macro-tracker

Personal single-page web app ("MACRO_LOG") for tracking daily macros and exercise. Static `index.html` plus two Netlify Functions; entries get logged to a Google Sheet via a Pabbly webhook.

## Stack and deploy

- **Frontend:** single static `index.html` (no framework, no build step)
- **Backend:** Netlify Functions in `netlify/functions/`
  - `analyze.mjs` — nutrition analysis
  - `log.mjs` — writes entries
- **Logging path:** browser → `log.mjs` → Pabbly webhook → Google Sheet. Exercise events were originally routed through a Google Apps Script but moved to Pabbly (commit `90994c9`).
- **Repo:** `github.com/ross1073/macro-tracker`
- **Deploy:** Netlify, auto-deploys on push to main via `.github/workflows/deploy.yml`. Netlify site ID `3d3edbd8-a28c-46fe-a5ba-bcedd59fd17d`.
- **"Done" = visible on the live URL after the Netlify build, not just merged to main.

## Notes

- Personal project, not part of any client or R&R portfolio.
- Meal type auto-detects from time of day — no manual picker (commit `4aa2298`). Don't reintroduce the picker.
- The "Today's Progress" coach panel was deliberately removed (commit `f37c9e6`). Don't add it back without asking.

## Memory system

The user profile (`~/.claude/user.md`), project brief, and the two most recent daily notes from `docs/memory/` auto-load into context via a SessionStart hook (`.claude/hooks/session-start-load-context.sh`); `docs/stage-current.md` loads too when present. Daily notes are written by the SessionEnd memory-keeper agent (`.claude/agents/memory-keeper.md`) — it appends a timestamped session block to `docs/memory/<YYYY-MM-DD>.md`, never overwriting prior days. The retired `docs/status.md` rolling file was migrated into the first dated note. `/audit-brief` is the manual drift check that compares the brief against the codebase and writes a severity-tagged findings file under `docs/audits/`.