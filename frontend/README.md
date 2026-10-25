# Gradelytics frontend preview

An interactive academic workspace built with React, TypeScript, Vite, Bun, and Tailwind CSS v4. Academic records remain in this browser. The Go API verifies GPA, improvement, and target calculations; accounts and database persistence are not connected yet.

## Run locally

From this folder:

```sh
bun install
bun run dev
```

The local preview is available at http://localhost:5173. Use the theme button in the header to compare the light and dark palettes.

For verified calculations, start the Go API in a second terminal from `../backend` with `go run ./cmd/api`. Vite forwards `/api` requests to `http://127.0.0.1:8080`; set `API_PROXY_TARGET` before starting Vite to override this development target. Production hosting must route `/api` to the Go service on the same origin.

While a request is pending or the service is unavailable, the interface explicitly labels the immediately available local estimate. Retry restores live verification without losing edits. Requests debounce for 120ms, abort on changed inputs or navigation, time out after five seconds, and never apply a result to different inputs. Only course IDs, credits, grades, and grading mappings are sent for calculation; names and attendance are omitted.

## Explore

- **Overview:** calculated GPA, credit progress, semester trends, and navigation to planning tools.
- **Academic record:** six sample semesters, editable grades, course creation, search, CSV import, and CSV export.
- **Grade simulator:** compare replacement grades, combine course improvements, and save local scenarios.
- **Target planner:** calculate the required future average and identify unreachable targets.
- **My curriculum:** an illustrative 160-credit degree and zero-credit mandatory requirements.
- **Attendance:** choose a threshold and mark classes present or absent.
- **Semester planner:** add dated items, mark them complete, and filter the list.
- **Grading settings:** separate 4-, 5-, 9-, and 10-point workspaces, editable decimal points, custom grade labels, and appearance settings.

## Data and assumptions

All student records, dates, and curriculum requirements are illustrative. Changes persist only in this browser's local storage under keys beginning with `gradelytics-`. Clearing site data restores the sample workspace. Grading presets are examples and must be checked against a university's official rules before real use.

The preview counts failed credits in GPA, excludes pass-only grades, and treats improvement scenarios as grade replacement with credits counted once. The target planner adds new GPA-bearing credits; it does not replace failed attempts. Assessment/exam marking formulas are intentionally deferred. CSV imports append records, validate the selected grade profile, and reject duplicate course-code/semester pairs atomically. PDF/OCR imports, cloud sync, and notifications are not part of this preview.

## Motion and backend foundation

Buttons have a brief press and centered ink expansion; navigation selections fill from the center. The sun/moon switch rotates and crossfades. Page changes use short, interruptible Web Animations with an inert copy of the outgoing content, keeping navigation clickable throughout. Charts and progress fills have brief entrances, with a reduced-motion path. No animation dependency was added.

The Go calculation API is in `../backend`, with its contract in `../backend/API.md`. Overview and semester GPA, improvement scenarios, and target planning use its verified results. Database-backed records and account ownership come next.

## Checks

```sh
bun run build
bun run lint
bun test
```

Focused tests cover credit weighting, failed grades, pass-only exclusions, fractional grade points, replacement scenarios, and target calculations.
