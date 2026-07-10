# Stage — current

## Current focus

Keeping the meal/exercise analyze path reliable. Two outages in three days — a retired model on 2026-07-08, then a timeout plus a JSON-parsing bug on 2026-07-10. Both fixed and verified live. No feature work in flight.

## In flight

- Nothing in code. One decision waits on Ross (see "Blocked / waiting on").

## Recently shipped

- Fixed two independent analyze failures (`2a82508`, 2026-07-10). Netlify 504s serve an HTML body, and `res.json()` was called before `res.ok`, so the real status became a bogus JSON syntax error. Separately, the model routinely prefaces its JSON with prose, so `JSON.parse` of the last text block threw — pre-existing, failed 2/3 runs on the old settings. Added `readAnalyzeResponse()` + `extractJson()` to `index.html`, cut `max_uses` 3→1, raised `max_tokens` 1000→1500. Verified 8/8 live against the deployed code.
- Corrected a wrong "no local Netlify auth" claim in the 2026-07-08 daily note (`99354f5`).
- Fixed meal/exercise analyze outage: retired `claude-sonnet-4-20250514` → `claude-sonnet-5`; added a self-healing model fallback chain in `analyze.mjs` and error-surfacing in the UI (`6f22c20`, `b33cdae`, `af45fb7`, 2026-07-08).
- Memory-system mitigations adopted from fb-tools (`2edc2dd`, May).
- Switched to dated daily notes + `user.md` auto-load (`54aa7b6`).
- Memory system added: auto-context-load + memory-keeper agent + `/audit-brief` (`44a02ca`).
- Netlify auto-deploy on push to main (`a5d453b`, merged via PR #5).
- Exercise logging routed through Pabbly instead of Google Apps Script (`90994c9`, PR #4).

## Blocked / waiting on

- **Ross's call:** add error-path logging to `analyze.mjs` (meal text + status, failures only)? It would make the next weird failure diagnosable from the real input instead of reconstructed. Trade-off: meal descriptions land in Netlify function logs. Nothing logs today — the 2026-07-09 failing query was unrecoverable.

## Notes

- No active feature branches visible; `main` is the working branch.
- Last app-level change was the 2026-07-10 analyze-parsing fix (`index.html`); before that, the 2026-07-08 model-retirement fix (`analyze.mjs`).
- Model selection lives in `analyze.mjs` as a fallback chain `[claude-sonnet-5, claude-opus-4-8]`, overridable via the `ANALYZE_MODELS` Netlify env var. Refresh every couple years as models retire.
- **Thin timeout margin.** The slowest verified meal takes 23.7s against Netlify's ~30s function ceiling. A slow web search could still 504 — but the toast now reads "Server timed out (504)…" instead of a parse error, so it's legible and retryable. If it recurs, raise the Netlify function timeout rather than re-diagnosing.
- The model *decides* whether to call `web_search`, so latency swings 10x between visually similar meals (Chipotle bowl 2.2s / no search; Panera salad 17–24s / searches). That is why the failures looked random.
- Verification drove the *deployed* parsing code against the live API, not an actual button tap. The browser-UI path (tap → macros render → Pabbly → sheet write) is still inferred, carried over from 2026-07-08.
