# AGENTS.md

## Project
GIS Registry Service.

Main areas:
- `backend/` - Python API (Litestar).
- `frontend/` - React/Vite UI.
- `database/` - migrations/setup.
- `deployment/` - Docker/Caddy/Authentik.

## Working style
Before changing code:
1. Inspect existing files, routes, DTOs, and contracts first.
2. Keep changes small, scoped, and reversible.
3. Do not rewrite unrelated areas.
4. Do not stage or commit unless explicitly asked.
5. Report: files changed, behavior changed, tests/build run, uncertainties.

Prefer pragmatic, human-maintainable code. Avoid AI-looking over-abstraction, broad refactors, and generic scaffolding.

## Architecture direction (manager)
- Backend is considered done unless fixing a real bug or adding a tiny frontend support endpoint.
- Old Authentik <-> registry sync idea was removed and replaced by credentials.
- Do not reintroduce old sync behavior.
- Authentik/Caddy handles internal GIS team login.
- Internal roles: `gis_admin`, `gis_manager`, `gis_editor`.
- Registry UI is for internal users only.
- Credentials are for external database users.
- Do not add login pages, user tables, or auth redesign.

## Credentials model
- Credentials management is an internal admin feature, not a login page.
- Role names must be dataset revision roles in this format:
  - `<dataset_slug>_v<revision_number>`
- Main frontend areas: Dataset Management and Credential Management.
- Password/secret is shown once only on create/change-password.
- Lost password flow is change/reset password, not mandatory credential recreation.
- Do not change existing credentials behavior unless fixing a confirmed bug.

## Backend safety
- Do not touch Caddy/deployment auth flow unless explicitly requested.
- Do not add session/login/logout systems.
- Do not add Authentik API sync/webhook sync.
- If adding support endpoint (e.g. `/v1/me`), keep it read-only, no DB, no writes, existing guards/envelope.

## GeoPackage/apply pipeline protection
Protect the latest manager pipeline. Do not regress to older approaches.
Do not reintroduce deprecated apply/validation patterns or older replacement flows.

## Frontend direction
- Preserve current workflow around datasets/revisions/specification/upload.
- Credential Management wording should stay precise: Credential, Database access, Role names, Expires, Revoke, Change password.
- Avoid misleading wording: external user login, signup, Authentik user sync.

## API conventions to respect
- Credentials endpoints under `/v1/credentials`.
- Credential fields include:
  - `credential_id`, `display_name`, `username`, `expires_at`, `role_names`,
  - `is_login_enabled`, `is_expired`, `is_active`, `created_at`, `updated_at`.
- Create/change-password responses include `secret.username` and `secret.password`.
- Delete success may be empty/null; do not assume JSON body.

## Commands (verify before use)
Backend:
- `cd backend`
- `hatch run service`
- `hatch run pytest` (or available test command)

Frontend:
- `cd frontend`
- `npm install`
- `npm run build`

Database:
- `cd database`
- run migration command defined in that module.

Deployment:
- `cd deployment`
- inspect available `hatch`/compose scripts before running.

## Git hygiene
Do not commit generated/local artifacts (`node_modules/`, `dist/`, `.env*`, `__pycache__/`, `*.pyc`, `*.tsbuildinfo`, temp files).

## When unsure
If request conflicts with "backend is done", stop and report trade-offs.
If manager intent is ambiguous, ask before broad implementation.
Prefer phased execution: inspect/report -> small wiring -> feature -> tests/build.

## Prompt reminder
Use this at the start of future Codex prompts:
"Read AGENTS.md first and follow it. Do not change unrelated files. Do not stage or commit unless I explicitly ask."
