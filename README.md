# AXIOM v3 — Neurosymbolic EOT Intelligence Platform

**"Every decision. Every reason. Every clause."**

FIDIC 2017 Conditions of Contract for Construction — Extension of Time Engine

---

## What's New in v3

### Complete UX Overhaul — "Precision Intelligence" Design System
- **Dark + Light mode** — Warm Amber (#E8A020) × Deep Indigo (dark) / Parchment (light)
- **Typography** — Sora (UI) + JetBrains Mono (data/code) from Google Fonts
- **Confidence Arc Gauge** — SVG arc animation showing entitlement confidence %
- **Compliance Timeline** — Visual 0–90 day interactive deadline tracker with live dots
- **Analysis Loading Overlay** — 4-stage pipeline progress with animated states
- **Glassmorphism header** — Sticky backdrop-blur with pipeline sub-bar
- **Micro-animations** — fadeUp cards, hover states, toast notifications
- **ConfidenceArc** — Radial gauge component with color-coded confidence
- **Toggle switches** — Custom animated boolean toggles replacing checkboxes

### All v2 Logic Preserved (Zero Regressions)
- 40 deterministic FIDIC 2017 rules across 8 priority tiers
- Knowledge graph: 35 nodes, 41 typed edges
- §18.2 Force Majeure 14-day notice (R008)
- §1.9 Prior Drawing Notice check (R018)
- §8.3 Recovery plan detection (R024)
- Undervalued claim detection (R037)
- Records not attached (R046)
- Determination max_tokens: 2500
- No confidential project data in any placeholder

---

## Architecture

```
Narrative/Docs
      ↓
LLM Parse (Claude — once, for extraction only)
      ↓
Knowledge Graph (35N · 41E typed property graph)
      ↓
Symbolic Rule Engine (40 rules, 8 priority tiers)
      ↓
XAI Reasoning Trace → Outcome + Quantum + Risk
      ↓
§3.7.3 Determination Letter (LLM narrates only)
```

**All legal decisions are deterministic and symbolic. The LLM never decides entitlement.**

---

## Quick Start

```bash
npm install
npm run dev
```

Requires: `VITE_ANTHROPIC_API_KEY` in `.env` OR deploy with the Cloudflare Worker proxy.

---

## Design Tokens

| Token         | Dark Mode      | Light Mode     |
|---------------|----------------|----------------|
| Background    | #080C14        | #F7F5F0        |
| Surface       | #0D1321        | #FFFFFF        |
| Amber Primary | #E8A020        | #C47B10        |
| Cyan Accent   | #38BDF8        | #0369A1        |
| Emerald OK    | #34D399        | #059669        |
| Rose Error    | #FB7185        | #E11D48        |
| Text Primary  | #E2EAF4        | #111827        |

---

## Deployment

- **Frontend**: `npm run build` → deploy `dist/` to Cloudflare Pages / GitHub Pages
- **API Proxy**: Deploy `worker.js` to Cloudflare Workers with `ANTHROPIC_API_KEY` secret
- **Database**: Optional — Supabase for claim history and user auth

---

*AXIOM v3 — Not legal advice. Indicative recommendations only.*
