# DnD Assistant — Web Editor

## Contracts System
All cross-project coordination lives in `../_contracts/`.

### ⚠️ GOVERNANCE — READ FIRST
**Read `../_contracts/GOVERNANCE.md` before doing anything.**
You are a **sub-agent (Web)**. You can:
- ✅ Check off YOUR Web checkboxes in tickets
- ✅ Add comments to tickets (use AGENT COMMENT format)
- ✅ Create ADRs in `../_contracts/decisions/`
- ❌ **DO NOT** create, delete, move, or rename tickets
- ❌ **DO NOT** edit ROADMAP, GOVERNANCE, or AGENT_GUIDE
- ❌ **DO NOT** change ticket priorities, descriptions, or specs
- ❌ **DO NOT** modify backend or iOS code

**Read `../_contracts/tickets/open/` at the start of every session.**
See `../_contracts/AGENT_GUIDE.md` for workflow instructions.
API contract (source of truth): `../DNDAssistantBackend/dnd_assistant/priv/static/swagger.json`

### Git
- Push to both remotes after each session: `git push origin main && git push gitea main`

---

## Project
React + Konva.js map editor for the Dungeon Master.
Served at `/dm` by Phoenix. DM draws maps, places tokens, controls fog of war.
Communicates via REST (map CRUD) and WebSocket (live battle events).

## Stack
- React 18 + TypeScript
- Konva.js — canvas-based map rendering
- Vite — dev server (port 5173)
- Phoenix Channel — WebSocket for live battle

## Key URLs (prod)
- Web editor: `https://dnd.vitskylab.dev/dm`
- API: `https://dnd.vitskylab.dev/api/v1/`
- WebSocket: `wss://dnd.vitskylab.dev/socket/websocket?token=JWT`

## Auth
DM logs in via `POST /api/v1/auth/login` → gets JWT → stores in localStorage.
All API requests: `Authorization: Bearer <token>`.

## Current Phase
Phase 6 — Maps & Battle (TICK-006, TICK-007). Not started yet.

## Relevant Tickets
- TICK-006: Maps REST API (backend + web)
- TICK-007: WebSocket battle events (backend + web + ios)
