// Model selection lives here (not in index.html) so there's a single source of
// truth, and so a retired model self-heals: we try MODELS in order and fall
// through to the next one whenever Anthropic reports the current pick has been
// retired (404 not_found_error). Two models from different tiers effectively
// never retire in the same window, so the analyze flow keeps working through a
// retirement with no code change. Refresh this list every year or two as models
// ship/retire — keep entries to current-generation models that accept the same
// request shape the frontend sends (thinking disabled + web_search_20260209).
//
// VERIFICATION BUILD: the retired claude-sonnet-4-20250514 is intentionally
// first here to prove the fallback fires end-to-end. The next commit drops it.
const MODELS = process.env.ANALYZE_MODELS
  ? process.env.ANALYZE_MODELS.split(",").map((s) => s.trim()).filter(Boolean)
  : ["claude-sonnet-4-20250514", "claude-sonnet-5", "claude-opus-4-8"];

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: "API key not configured" }), { status: 500 });
  }

  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };

  try {
    const body = await req.json();
    let lastData = { error: "No models available" };
    let lastStatus = 502;

    for (const model of MODELS) {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({ ...body, model }),
      });
      const data = await res.json();
      lastData = data;
      lastStatus = res.status;

      // Only fall through when THIS model is the problem (retired / unknown).
      // Any other outcome — success, or a real error like a 400/429 — returns
      // immediately so we don't burn the whole list on an unrelated failure.
      const modelRetired = res.status === 404 && data?.error?.type === "not_found_error";
      if (!modelRetired) {
        return new Response(JSON.stringify(data), { status: res.status, headers });
      }
    }

    // Every model in the list was unavailable — surface the last error.
    return new Response(JSON.stringify(lastData), { status: lastStatus, headers });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers,
    });
  }
};

export const config = {
  path: "/api/analyze",
};
