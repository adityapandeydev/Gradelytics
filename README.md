# Gradelytics

A student academic workspace for GPA tracking, grade-improvement scenarios, target planning, curriculum progress, attendance, and semester planning.

## Run locally

Start the calculation API in one terminal:

```powershell
cd backend
go run ./cmd/api
```

Start the frontend in another:

```powershell
cd frontend
bun install
bun run dev
```

Open http://localhost:5173. The API listens on `127.0.0.1:8080`; Vite forwards `/api` requests to it. No database or credentials are required for this stage.

## Current capabilities

- Configurable 4-, 5-, 9-, and 10-point profiles, decimal grade points, F/P outcomes, and zero-credit requirements.
- Editable academic history, CSV import/export, and browser-local saving.
- Verified Go calculations for GPA, replacement-grade scenarios, and future GPA targets.
- Immediate, clearly labeled local estimates when live calculations are pending or unavailable; retry without losing inputs.
- Curriculum and attendance previews, a local semester planner, and light/dark themes with reduced-motion support.

The demo records and curriculum requirements are illustrative. Institution-specific assessment formulas are deferred. PostgreSQL persistence, accounts, and ownership authorization are upcoming work.

## Verification

From `frontend`: `bun run build`, `bun run lint`, and `bun test`.

From `backend`: `go test ./...`, `go vet ./...`, and `go build ./...`.

See [frontend/README.md](frontend/README.md) and [backend/API.md](backend/API.md) for details.
