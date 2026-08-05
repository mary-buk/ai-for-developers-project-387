# AGENTS.md

Hexlet course project (`ai-for-developers-project-387`). API design lives in `tsp/` (TypeSpec, `tspconfig.yaml` at repo root) as a spec only. Frontend lives in `frontend/` (React 18 + Vite 6 + TypeScript, react-router 6). Backend lives in `backend/` (Node.js 20 + Express + TypeScript, ESM, in-memory storage) and implements the contract API exactly — do not add endpoints or change paths/payloads without changing the spec first.

## Backend

- Commands (from `backend/`): `npm install`, `npm run dev` (tsx watch, port 3000 = frontend proxy target), `npm run build` (tsc -> dist), `npm start`, `npm test` (node:test via tsx, tests/ only covers src/domain).
- `backend/src/types.ts` manually mirrors `tsp/models.tsp` — keep in sync with the spec (same as the frontend does).
- ESM with NodeNext: relative imports in `src/` use `.js` extensions.
- Validation is hand-rolled in routes, mirroring spec rules; error body is always `{ code, message }` (ErrorBody). POST /bookings has no 404 in the spec — unknown eventTypeId is a 400.
- Domain rules (30-min grid 09:00–18:00, 14-day window, global overlap check) live in `backend/src/domain/`; storage interfaces in `src/storage/repository.ts` with in-memory impls in `src/storage/memory.ts` (state resets on restart).

## Frontend

- Commands (from `frontend/`): `npm install`, `npm run dev`, `npm run build` (tsc + vite build).
- No generated API client: `frontend/src/api.ts` has hand-written fetch wrappers; `frontend/src/types.ts` manually mirrors `tsp/models.tsp` — keep both in sync with the spec.
- Backend URL: `VITE_API_URL` env var (`.env.example`); empty = same-origin. Dev proxy in `frontend/vite.config.ts` -> `http://localhost:3000`, but only for contract API paths via regex keys (`^/event-types$`, `^/event-types/:id/slots`, `^/bookings`) — a plain `/event-types` prefix would swallow the SPA page route `/event-types/:id`.
- Routes: `/` guest catalog, `/event-types/:id` guest booking (14-day window), `/admin` owner event types, `/admin/bookings` upcoming bookings.

## Project decisions (calendar booking)

- Two roles, no auth: single predefined owner profile (admin) + guests booking without an account.
- Entities: `EventType` (id, title, description, durationMinutes), `Booking` (id, eventTypeId, guestName, startTime, endTime, createdAt). `Slot` is computed, not stored.
- Free-slot grid: working window 09:00–18:00, 30-minute steps, next 14 days from the current date. A slot is offered only if startTime + durationMinutes <= 18:00.
- Busy rule is global: a time cannot be double-booked even by different event types (checked server-side).
- Storage: in-memory behind a repository interface — simplest for a study project; no delete/edit/cancel of event types or bookings yet.
- Guest landing page and the owner admin list share one `GET /event-types` op in the TypeSpec spec.

## E2E, commits, releases

- E2E (Playwright) lives in `e2e/` (separate package): `npm install`, `npx playwright install chromium` (once), `npm test`. Tests drive the REAL apps in a browser — no mocks; Playwright's `webServer` starts backend (:3001) and frontend (:5174) itself on dedicated test ports and never reuses running servers (a reused server could be stale or, worse, another project's dev process squatting on the default port).
- `workers: 1` on purpose: backend state is in-memory and shared between tests. Seed data via API helpers (`e2e/tests/helpers.ts`), never through the UI. Tests always book TOMORROW (today's slots depend on the time of day).
- `00-empty-state.spec.ts` assumes an empty backend — Playwright always boots a fresh backend process on the test port, so it holds locally and in CI.
- CI workflows: `e2e.yml` (backend unit tests + Playwright on push/PR), `conventional-commits.yml` (PR commit messages via commitlint), `release-please.yml` (release PRs/tags on pushes to main). `hexlet-check.yml` stays untouched.
- Commits follow Conventional Commits (`feat:` / `fix:` / `chore:` / `docs:` ...). release-please uses the `simple` strategy (version in `.release-please-manifest.json`): `feat` -> minor, `fix` -> patch; merging its release PR creates the tag and GitHub release.

## Docker & deploy

- Single image via the root `Dockerfile` (multi-stage: frontend build -> backend build -> node:20-alpine runtime, prod deps only). Express serves BOTH the API and the built frontend from `backend/public` (`/app/public` in the image, `STATIC_DIR` overrides).
- `backend/src/app.ts` serves static + SPA fallback only when the static dir exists — in dev (tsx watch) it doesn't, so local dev is unchanged. Fallback sends `index.html` for non-API GET paths; `/event-types/:id` is a PAGE route, only `/event-types/:id/slots` and `/bookings*` stay JSON-404.
- App honors `PORT` (default 3000) — Render/Railway inject it automatically. Image has a HEALTHCHECK on `GET /event-types`.
- Timezone: the 09:00–18:00 window is evaluated in the SERVER timezone — UTC inside the container (node:20-alpine, no tzdata). The frontend displays slots in the browser's local TZ, so the visible window shifts accordingly. Validated image: `calendar-booking:latest` (~200MB).
- Deploy: Render via `render.yaml` Blueprint (free plan, healthCheckPath `/event-types`, autoDeploy from main). Public URL goes into `README.md` after the first deploy.

## Hard constraints

- `.github/workflows/hexlet-check.yml` is auto-generated by Hexlet. **Never edit, delete, or rename it** (same applies to renaming the repo). Hexlet runs its test harness on every push via the `HEXLET_ID` secret.
- There is no local test/lint command. Verification is done by pushing a commit and letting the Hexlet CI run.
- `README.md` is the badge + repo status; keep it in sync with project state.
