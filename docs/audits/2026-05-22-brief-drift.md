# Brief drift audit — 2026-05-22

Audited `docs/project-brief.md` (working-tree version; the file is currently **modified and uncommitted** on top of HEAD `2edc2dd`). Checked every verifiable claim against the repo (code, configs, hooks, workflow), the `git log`, the committed-vs-working-tree diff, and the live deploy history via the GitHub Actions API.

**What could be checked:** file layout, sizes, fonts, function behavior, commit SHAs and their messages, the deploy workflow and its run history, the memory-system wiring (hooks + `settings.json`), and the presence/absence of every file the brief names.

**What could not be checked:** the Pabbly webhook → Google Sheet forwarding (third-party, no vantage), and whether the Netlify env vars (`ANTHROPIC_API_KEY`, `PABBLY_WEBHOOK_URL`) are actually populated in the Netlify dashboard. Netlify hosting is treated as effectively confirmed because two `deploy.yml` runs completed successfully.

**Headline:** the application half of the brief (frontend, functions, deploy, conventions, referenced commits) is accurate. The **memory-system paragraph (line 38) is the problem** — it documents a SessionEnd `memory-keeper` agent that is being torn out in the working tree, is not wired in the on-disk `settings.json`, and is demonstrably not running (this session opened with a 16-day staleness warning). It also omits the mitigation layer (beacon hook + `/audit-memory`) that commit `2edc2dd` actually added.

---

## Severity legend

- **passes** — claim matches reality.
- **dangerous** — wrong in a way that breaks something if acted on.
- **misleading** — wrong in a way that wastes a future reader's time.
- **stale** — was true at some point, no longer.
- **cosmetic** — pointer/filename detail slightly off, doesn't impair understanding.
- **unverifiable** — couldn't be confirmed from this session's vantage point.

---

## Findings

| # | Brief claim (line) | Reality | Severity |
|---|---|---|---|
| 1 | Daily notes are written by the SessionEnd memory-keeper agent at `.claude/agents/memory-keeper.md` (L38) | Agent file is **deleted in the working tree** (`git status`: `D .claude/agents/memory-keeper.md`); `settings.json` on disk has **no SessionEnd hook** (block removed vs HEAD); session-start staleness warning fired (latest note `2026-05-06`, 16 days behind). The mechanism is not running. | dangerous |
| 2 | Memory-system paragraph describes only SessionStart load + SessionEnd memory-keeper (L38) | Omits the layer added by `2edc2dd` (May 11): `session-beacon.sh` Stop hook, `docs/memory/.session-beacons.log`, `/audit-memory` command, and the staleness warning. Brief was edited May 16 (after) but doesn't mention any of it. | misleading |
| 3 | `/audit-brief` … writes a findings file under `docs/audits/` (L38) | Command works (running now) but lives at **global** `~/.claude/commands/audit-brief.md`; the project-local copy is **deleted** (`D .claude/commands/audit-brief.md`). `docs/audits/` did not exist until this run created it. | cosmetic |
| 4 | "two most recent daily notes from `docs/memory/`" auto-load (L38) | Only **one** daily note exists (`2026-05-06.md`); at most one can load. Not false, just thinner than implied. | cosmetic |
| 5 | index.html input toggle is "text vs other" (L21) | Toggle is **text vs photo** ("Describe Meal" / "Upload Photo"). "other" is vague. | cosmetic |
| 6 | `log.mjs` posts to Pabbly webhook, which forwards to a Google Sheet (L14) | Code half confirmed: `log.mjs` POSTs to `PABBLY_WEBHOOK_URL`. The "forwards to a Google Sheet" half is Pabbly-side. | unverifiable (Pabbly) |
| 7 | Netlify env vars implied present (`ANTHROPIC_API_KEY` in analyze, `PABBLY_WEBHOOK_URL` in log) | Both functions read these env vars and 500 if absent. Whether they're set in Netlify can't be seen from here. | unverifiable (Netlify dashboard) |
| 8 | Frontend `index.html` ~32 KB at repo root, no build step, Space Mono + DM Sans, `:root` tokens (L11) | `index.html` = 32,213 bytes at root; no `package.json`; both fonts and `:root` present. | passes |
| 9 | Two Netlify Functions `analyze.mjs` + `log.mjs` in `netlify/functions/`; analyze does the LLM call (L12–13) | Both present; `analyze.mjs` proxies to `api.anthropic.com/v1/messages`. | passes |
| 10 | Exercise moved to Pabbly in commit `90994c9` (L15) | `90994c9` = "Route exercise through Pabbly instead of Apps Script", 2026-04-21. | passes |
| 11 | Auto-deploys on push to main via `.github/workflows/deploy.yml`; site ID `3d3edbd8-…` (L16) | `deploy.yml` triggers on `push: [main]`, runs `netlify-cli deploy --prod`; two runs succeeded (Apr 22, May 11). Site ID matches secret set during setup. | passes |
| 12 | Meal type auto-detects from time of day, commit `4aa2298` (L30) | `4aa2298` = "Auto-detect meal type from time of day — no more manual picker"; `meal-indicator`/`mealIndicator` present in `index.html`. | passes |
| 13 | "Today's Progress" panel removed, commit `f37c9e6` (L31) | `f37c9e6` = "Remove Today's Progress coach panel"; grep for `coach-panel`/`TODAY'S PROGRESS` in `index.html` = 0. | passes |
| 14 | `docs/status.md` retired and migrated into the first dated note (L38) | `2026-05-06.md` opens with "Migrated from docs/status.md"; no `docs/status.md` remains. | passes |
| 15 | `CLAUDE.md` holds project conventions (L25) | Present at root, 1,911 bytes. | passes |
| 16 | `docs/stage-current.md` loads when present (L38) | File exists and was loaded into this session's context. | passes |

---

## Notes — items worth a closer look

**1 (dangerous).** This is the load-bearing problem. The brief tells a future reader/agent that daily notes are produced automatically by a SessionEnd `memory-keeper` agent. In the committed HEAD that's true (`settings.json` at HEAD has the SessionEnd agent hook, and the agent file is tracked). But the **working tree has reversed it**: `memory-keeper.md`, `session-end-memory-keeper.sh`, and the project-local `audit-brief.md` are all `D` (deleted), and `settings.json` is modified to drop the entire `SessionEnd` block. Net effect right now: nothing writes daily notes, which is exactly why this session began with `🚨 MEMORY STALE 🚨` and why the last note is `2026-05-06`. Someone is mid-refactor (likely moving fully onto the beacon-based approach), but the brief still presents the old mechanism as live. Either finish the refactor and rewrite L38, or restore the SessionEnd wiring — but don't leave the brief asserting a mechanism that's both deleted and silent.

**2 (misleading).** Commit `2edc2dd` ("adopt SessionEnd-failure mitigations from fb-tools") added a real, present second layer: a `Stop`-hook `session-beacon.sh` that appends to `docs/memory/.session-beacons.log`, plus an `/audit-memory` slash command, plus the staleness banner in `session-start-load-context.sh`. The brief — edited May 16, five days *after* that commit — describes none of it. A reader trying to understand how memory actually works today would miss the entire detection/redundancy story.

**3 (cosmetic).** The `/audit-brief` claim is functionally true (this file is the proof), but the project-local command is deleted; it only runs because a global copy exists at `~/.claude/commands/audit-brief.md`. And `docs/audits/` was absent until this run. Worth a one-line note in the brief that the command is global, not vendored in-repo.

**4 (cosmetic).** "Two most recent daily notes" over-promises against a `docs/memory/` that contains exactly one note. Self-corrects as more notes accrue — *if* finding #1 gets fixed so notes start being written again.

**5 (cosmetic).** "input toggle (text vs other)" — the second option is specifically a photo upload. Minor, but "other" reads like the author didn't remember. Change to "text vs photo".

**6 / 7 (unverifiable).** The Pabbly→Sheet hop and the Netlify env var population are both outside this vantage. To verify: (6) check the Pabbly workflow's task history and the target Google Sheet; (7) Netlify dashboard → Site configuration → Environment variables, confirm `ANTHROPIC_API_KEY` and `PABBLY_WEBHOOK_URL` exist.

---

## What I couldn't check

- **Pabbly webhook → Google Sheet forwarding** (finding 6) — needs the Pabbly dashboard / the destination sheet. The repo only proves the POST leaves `log.mjs`.
- **Netlify environment variables** (finding 7) — `ANTHROPIC_API_KEY`, `PABBLY_WEBHOOK_URL` — need the Netlify dashboard. Functions error without them; can't see their values from here.
- **Live production behavior of the site** — deploy runs succeeded, so the build is confirmed, but a true end-to-end (log a meal, see it land in the sheet) requires the two external venues above.

## What passes (compact list)

- **Frontend:** single `index.html` at root, 32,213 bytes (~32 KB), no build step / no `package.json`, Space Mono + DM Sans, `:root` tokens, dark theme. (8)
- **Functions:** `analyze.mjs` (Anthropic proxy) + `log.mjs` (Pabbly POST) both present in `netlify/functions/`. (9)
- **Commits referenced all resolve and match their messages:** `90994c9` Pabbly exercise route (10), `4aa2298` meal auto-detect (12), `f37c9e6` panel removal (13).
- **Deploy:** `deploy.yml` triggers on push to main, runs `netlify-cli deploy --prod`, two successful runs; site ID matches. (11)
- **Conventions:** no build step, no tests, no framework/bundler/analytics/auth — all confirmed. (12–13, plus L32–34)
- **Memory plumbing that does exist:** SessionStart load hook wired and functioning; `docs/stage-current.md` present and loaded; `docs/status.md` retired into `2026-05-06.md`. (14, 16, and the SessionStart half of L38)
- **`CLAUDE.md`** present at root. (15)
