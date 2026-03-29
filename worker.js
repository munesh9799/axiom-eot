/**
 * AXIOM — Cloudflare Worker API Proxy (Production)
 * ─────────────────────────────────────────────────
 * Securely forwards requests from the browser to the Anthropic API.
 * Your API key lives only in Cloudflare — never exposed to users.
 *
 * DEPLOY STEPS (one-time, ~5 minutes):
 * ─────────────────────────────────────
 * 1. Install Wrangler CLI:
 *      npm install -g wrangler
 *
 * 2. Login to Cloudflare:
 *      wrangler login
 *
 * 3. Deploy this worker:
 *      wrangler deploy worker.js --name axiom-proxy
 *
 * 4. Add your Anthropic API key as a secret (prompted to paste it):
 *      wrangler secret put ANTHROPIC_API_KEY
 *
 * 5. Copy your worker URL (shown after deploy, looks like):
 *      https://axiom-proxy.YOUR-SUBDOMAIN.workers.dev
 *
 * 6. Paste that URL into App.jsx at the top:
 *      const PROXY_URL = "https://axiom-proxy.YOUR-SUBDOMAIN.workers.dev";
 *
 * COST: Free — Cloudflare Workers free plan = 100,000 requests/day.
 * Your Anthropic API usage is billed to your Anthropic account separately.
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {

    // ── CORS preflight ────────────────────────────────────────────────────
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    // ── Only allow POST ───────────────────────────────────────────────────
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // ── Check API key is configured ───────────────────────────────────────
    if (!env.ANTHROPIC_API_KEY) {
      return new Response(JSON.stringify({
        error: "ANTHROPIC_API_KEY secret is not set. Run: wrangler secret put ANTHROPIC_API_KEY"
      }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }

    // ── Forward request to Anthropic ──────────────────────────────────────
    try {
      const body = await request.json();

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type":      "application/json",
          "x-api-key":         env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      return new Response(JSON.stringify(data), {
        status: response.status,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      });
    }
  },
};
