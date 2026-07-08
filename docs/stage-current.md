# Stage — current

## Current focus

UNKNOWN — needs Ross to fill in. Most recent code commits (late April) wrapped up the memory-system plumbing and the Pabbly exercise route; no active feature work is visible in git since then.

## In flight

- UNKNOWN — needs Ross to fill in.

## Recently shipped

- Fixed meal/exercise analyze outage: retired `claude-sonnet-4-20250514` → `claude-sonnet-5`; added a self-healing model fallback chain in `analyze.mjs` and error-surfacing in the UI (`6f22c20`, `b33cdae`, `af45fb7`, 2026-07-08).
- Memory-system mitigations adopted from fb-tools (`2edc2dd`, May).
- Switched to dated daily notes + `user.md` auto-load (`54aa7b6`).
- Memory system added: auto-context-load + memory-keeper agent + `/audit-brief` (`44a02ca`).
- Netlify auto-deploy on push to main (`a5d453b`, merged via PR #5).
- Exercise logging routed through Pabbly instead of Google Apps Script (`90994c9`, PR #4).

## Blocked / waiting on

- UNKNOWN — needs Ross to fill in.

## Notes

- No active feature branches visible; `main` is the working branch.
- Last app-level change was the 2026-07-08 model-retirement fix + fallback (`analyze.mjs`); before that, the Pabbly exercise route in late April.
- Model selection now lives in `analyze.mjs` as a fallback chain `[claude-sonnet-5, claude-opus-4-8]`, overridable via the `ANALYZE_MODELS` Netlify env var. Refresh every couple years as models retire.
- The only `docs/memory/` entry so far is the seed note migrated from `docs/status.md` on 2026-05-06; future sessions will append.
