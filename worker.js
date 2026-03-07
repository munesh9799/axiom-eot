/**
 * AXIOM — Cloudflare Worker API Proxy
 * Secures the Anthropic API key. Deploy free on Cloudflare Workers (100k req/day).
 *
 * Deploy:
 *   npm install -g wrangler
 *   wrangler login
 *   wrangler deploy worker.js --name axiom-proxy
 *   wrangler secret put ANTHROPIC_API_KEY
 *
 * Then update App.jsx: replace "https://api.anthropic.com/v1/messages"
 * with "https://axiom-proxy.YOUR-SUBDOMAIN.workers.dev"
 */

const CORS_HEADERS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const body = await request.json();

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": env.ANTHROPIC_API_KEY,
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
