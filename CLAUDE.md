# DnD Assistant — Web Editor

## Contracts System
All cross-project coordination lives in `../_contracts/`.

### ⚠️ GOVERNANCE — READ FIRST
**Read `../_contracts/GOVERNANCE.md` before doing anything.**
You are a **sub-agent (Web)**. Your scope is ONLY the Web project.

**You can:**
- ✅ Write code ONLY in this Web repo
- ✅ Check off checkboxes ONLY under `## Web` sections in tickets
- ✅ Add AGENT COMMENT at the bottom of tickets (see GOVERNANCE.md for format)
- ✅ Create ADRs in `../_contracts/decisions/`

**You MUST NOT:**
- ❌ Create, delete, move, or rename tickets
- ❌ Edit ROADMAP, GOVERNANCE, or AGENT_GUIDE
- ❌ Change ticket titles, priorities, descriptions, or field specs
- ❌ Check off checkboxes under `## Backend` or `## iOS` sections
- ❌ Modify backend or iOS code
- ❌ Move tickets from `open/` to `done/`

**When reading tickets:** Only look at the `## Web` section for your tasks. Ignore `## Backend` and `## iOS` sections — those belong to other agents.

**Read `../_contracts/tickets/open/` at the start of every session.**
See `../_contracts/AGENT_GUIDE.md` for workflow instructions.
API contract (source of truth): `../DNDAssistantBackend/dnd_assistant/priv/static/swagger.json`

### Git
- Push to both remotes after each session: `git push origin main && git push gitea main`

### 🎯 Current Sprint (Sprint 2, 2026-03-29)

Both tickets can be done in parallel. No blockers.

1. **TICK-008** — Battle combat UI in BattlePage
   - Combat log panel in sidebar — shows `dice_rolled`, `hp_updated`, `condition_changed` events (chronological, newest on top)
   - Roll dice button in InitiativePanel (on current player's turn) → sends `roll_dice`
   - HP bar per token on BattleCanvas (small bar under token circle, green→red gradient)
   - Condition icons on tokens (tiny icons: skull, eye-slash, etc.)

2. **TICK-009** — Session management UI in BattlePage
   - Players panel in sidebar — shows online players (green dot), DM can click to kick
   - "End Battle" button for DM in BattlePage header
   - Handle `player_joined` / `player_left` — update online player list
   - Handle `battle_ended` — show "Battle ended" overlay with Back button

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
