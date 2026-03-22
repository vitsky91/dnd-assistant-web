# DnD Assistant — Web Editor

## Contracts System
All cross-project coordination lives in `../_contracts/`.
**Read `../_contracts/tickets/open/` at the start of every session.**
See `../_contracts/AGENT_GUIDE.md` for full instructions.
API contract (source of truth): `../DNDAssistantBackend/dnd_assistant/priv/static/swagger.json`

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
