# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Factory Inventory Management System Demo with GitHub integration - Full-stack application with Vue 3 frontend, Python FastAPI backend, and in-memory mock data (no database).

> ⚠️ **This repository and any fork you create are PUBLIC.** Do not commit credentials, internal hostnames, or private registry URLs. `client/.npmrc` pins the public npm registry and `client/package-lock.json` is gitignored to prevent locally-configured registries from leaking into commits — leave both in place.

## Critical Tool Usage Rules

### Subagents
Use the Task tool with these specialized subagents for appropriate tasks:

- **vue-expert**: Use for Vue 3 frontend features, UI components, styling, and client-side functionality
  - Examples: Creating components, fixing reactivity issues, performance optimization, complex state management
  - **MANDATORY RULE: ANY time you need to create or significantly modify a .vue file, you MUST delegate to vue-expert**
- **code-reviewer**: Use after writing significant code to review quality and best practices
- **Explore**: Use for understanding codebase structure, searching for patterns, or answering questions about how components work
- **general-purpose**: Use for complex multi-step tasks or when other agents don't fit

### Skills
- **backend-api-test** skill: Use when writing or modifying tests in `tests/backend` directory with pytest and FastAPI TestClient

### MCP Tools
- **ALWAYS use GitHub MCP tools** (`mcp__github__*`) for ALL GitHub operations
  - Exception: Local branches only - use `git checkout -b` instead of `mcp__github__create_branch`
- **ALWAYS use Playwright MCP tools** (`mcp__playwright__*`) for browser testing
  - Test against: `http://localhost:3000` (frontend), `http://localhost:8001` (API)

## Stack
- **Frontend**: Vue 3 + Composition API + Vite (port 3000)
- **Backend**: Python FastAPI (port 8001)
- **Data**: JSON files in `server/data/` loaded via `server/mock_data.py`

## Quick Start

```bash
# Backend
cd server
uv run python main.py

# Frontend
cd client
npm install && npm run dev
```

## Key Patterns

**Filter System**: 4 filters (Time Period, Warehouse, Category, Order Status) apply to all data via query params
**Data Flow**: Vue filters → `client/src/api.js` → FastAPI → In-memory filtering → Pydantic validation → Computed properties
**Reactivity**: Raw data in refs (`allOrders`, `inventoryItems`), derived data in computed properties

## Commands

```bash
./scripts/start.sh | ./scripts/stop.sh      # both servers (installs deps if missing; requires uv)
cd client && npm run build                  # production build -> client/dist/ (no lint, no frontend tests)
cd tests && uv run pytest                   # all backend tests (~40, run in <1s)
cd tests && uv run pytest backend/test_inventory.py -k filter   # single file / keyword
```

- Backend deps are managed by `uv` (`server/pyproject.toml`; `server/requirements.txt` mirrors the runtime deps for plain pip). If `uv` is missing, `pip install fastapi uvicorn pydantic pytest pytest-asyncio httpx` in a venv works; run `python main.py` from `server/` and `pytest` from `tests/`.
- `tests/backend/conftest.py` imports `main.app` by adding `server/` to `sys.path`, so tests must be run against that layout.
- `client/CLAUDE.md` and `server/CLAUDE.md` hold generic Vue/FastAPI conventions; read them when working in those directories.

## Architecture

- **Backend** (`server/main.py`, ~300 lines): single file holding the Pydantic models, CORS (`allow_origins=["*"]`), and all routes. `server/mock_data.py` loads every `server/data/*.json` once at import time into module-level lists; routes filter those lists in Python. Nothing persists, so a restart resets state. `generate_data.py` regenerates the JSON.
- **Frontend** (`client/src`): routes are registered in `main.js` (Dashboard, Inventory, Orders, Demand, Spending, Reports). All HTTP goes through `api.js`, which hardcodes `http://localhost:8001/api` and drops any filter equal to `'all'`.
- **Filters**: `composables/useFilters.js` is a module-level singleton (shared refs, not per-component). Its `selectedPeriod` is sent to the API as `month`, and `selectedLocation` as `warehouse`. `FilterBar.vue` edits it, and views re-fetch via `getCurrentFilters()`.
- **i18n**: `composables/useI18n.js` with `locales/en.js` and `locales/ja.js`. New UI strings need entries in both.
- **Auth/profile/tasks UI** (`useAuth.js`, `ProfileMenu`, `TasksModal`) is client-side scaffolding hosted in `App.vue`.

## Known gaps (verify before relying on these)

- `api.js` calls `/api/tasks` (GET/POST/PATCH/DELETE) and purchase-order endpoints, but `main.py` only has GET routes and no tasks or purchase-order routes. The dev server logs a 404 for tasks on load.
- `Dashboard.vue` renders `<PurchaseOrderModal>`, but that component does not exist in `client/src/components/`, which produces a Vue "Failed to resolve component" warning.
- `views/Backlog.vue` exists but has no route in `main.js`.
- `tests/README.md` lists `test_orders.py`, which is not in the repo.

## API Endpoints
- `GET /api/inventory` - Filters: warehouse, category
- `GET /api/orders` - Filters: warehouse, category, status, month
- `GET /api/dashboard/summary` - All filters
- `GET /api/demand`, `/api/backlog` - No filters
- `GET /api/spending/*` - Summary, monthly, categories, transactions

## Code Comments
Always document non-obvious logic changes with comments explaining why (workarounds, edge cases, data-shape assumptions). Skip comments on obvious code.

## Common Issues
1. Use unique keys in v-for (not `index`) - use `sku`, `month`, etc.
2. Validate dates before `.getMonth()` calls
3. Update Pydantic models when changing JSON data structure
4. Inventory filters don't support month (no time dimension)
5. Revenue goals: $800K/month single, $9.6M YTD all months

## File Locations
- Views: `client/src/views/*.vue`
- API Client: `client/src/api.js`
- Backend: `server/main.py`, `server/mock_data.py`
- Data: `server/data/*.json`
- Styles: `client/src/App.vue`

## Design System
- Colors: Slate/gray (#0f172a, #64748b, #e2e8f0)
- Status: green/blue/yellow/red
- Charts: Custom SVG, CSS Grid for layouts
- No emojis in UI
