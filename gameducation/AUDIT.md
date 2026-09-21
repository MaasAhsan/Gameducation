# Security and bug audit (Forge VERIFY)

Scope: `gameducation` Node static+WS server and browser client.  
Date: 2026-09-21. Runtime verified: Node v24.15.0, `ws` 8.18.3.

## Verified working

- `GET /health` returns JSON.
- `GET /` and `/config.js` serve.
- WebSocket `/ws`: host_create → join → host_start → answer (manual client test).
- Question bank: 150 items, 10 in every category × difficulty cell.
- `node --check` on server and `public/js/app.js` passes.

## Findings

### High — treat as secrets hygiene, not app RCE

- The chat included the project URL, publishable key, and a Postgres URI template. The publishable key is designed for browsers, but a **database password or service role must never** be placed in this repo, `/config.js`, or Railway public variables.
- If a real DB password or service-role key was pasted anywhere, rotate it in the Supabase dashboard and use dashboard SQL only for `schema.sql`.

### Medium — classroom protocol is code-gated, not account-gated

- Anyone who knows a 5-character room code can join while the room exists (`32^5` space, no login). That matches Kahoot-style class codes, not a private exam.
- There is no per-IP rate limit on `host_create` or `join`. A noisy client can open many rooms until the process is recycled.
- Host disconnect deletes the room. That is intentional, but an unstable teacher network drops the class.

### Medium — Supabase is not wired until SQL + Email provider are enabled

- Schema and RLS live in `supabase/schema.sql` and are **not applied from this environment** (no service role, no interactive `supabase login`).
- Until that SQL runs, email signup will not create `profiles`, and custom-set sync will fail quietly while local guest data still works.

### Low — XSS / HTML injection

- Render path uses `innerHTML`, but player-facing strings go through `escapeHTML`.
- Do not later interpolate raw `q.q` or names into `onclick` without escaping. Set ids from Supabase UUIDs and generated local ids are safe.

### Low — static server

- Paths are normalized and rejected if they escape `public/`. Verified by code inspection.
- No Content-Security-Policy, no HTTPS termination in-app (Railway/edge should terminate TLS).

### Bugs fixed in this pass

- Settings gear no longer calls `goHome()`. Settings is a modal; quiz/party state stays in memory.
- Copy now says **hingga N soal**, shows the real pool size, and disables start below 8 bank questions.
- Hero is a 64px overflow-hidden bar; category chips use one min-height; first chip is **Semua** and full width; stack gap is 12px; viewport-wide page background; credit contrast + Indonesian wording.

### Residual product gaps (not blockers)

- Server-side scores are not written to Supabase; only the browser records history when a session exists.
- Collectibles are cosmetic flags, not tradable items.
- No image/audio questions (Kahoot media).
- Guest gems live in `localStorage` and can be edited in DevTools. Signed-in gems depend on RLS + honest client updates (same class of game as many casual web games). For anti-cheat, move gem grants to a trusted backend later.

## Verdict

Ship-as-classroom-demo: **LIKELY safe** if only the anon key is public, RLS is applied, and rooms are treated as public-to-the-code.  
Not a hardened exam platform.
