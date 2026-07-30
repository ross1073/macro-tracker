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

Context auto-loads at SessionStart via four **global** hooks, `~/.claude/hooks/project-context-load-1..4.sh` (1 = time anchor + `docs/stage-current.md`, 2 = `docs/project-brief.md`, 3 = the per-project `MEMORY.md` index, 4 = recent `docs/memory/` daily notes — two if both fit, else the newest); the user profile (`~/.claude/user.md`) comes from a separate global hook, `memory-load.sh`. The ~10,000-byte SessionStart cap is **per hook, not per session**, so each part holds itself under 9,000 bytes and truncates an oversized file with a marker naming it and its full size — the rest is still on disk, never dropped to a pointer. More context means adding a part, never growing one. The repo-local `.claude/hooks/session-start-load-context.sh` was retired 2026-07-30 (unregistered, kept on disk with a dated header); it had no budget logic at all. Daily notes are written by the SessionEnd memory-keeper agent (`.claude/agents/memory-keeper.md`) — it appends a timestamped session block to `docs/memory/<YYYY-MM-DD>.md`, never overwriting prior days. The retired `docs/status.md` rolling file was migrated into the first dated note. `/audit-brief` is the manual drift check that compares the brief against the codebase and writes a severity-tagged findings file under `docs/audits/`.