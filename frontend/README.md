# Gradelytics frontend preview

An interactive academic workspace built with React, TypeScript, Vite, Bun, and Tailwind CSS v4. This stage is entirely frontend: no backend, accounts, or database connections.

## Run locally

From this folder:

```sh
bun install
bun run dev
```

The local preview is available at http://localhost:5173. Use the theme button in the header to compare the light and dark palettes.

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

The initial Go calculation API is in `../backend`, with its contract in `../backend/API.md`. The preview is intentionally still local; database-backed records and API integration come next.

## Checks

```sh
bun run build
bun run lint
bun test
```

Focused tests cover credit weighting, failed grades, pass-only exclusions, fractional grade points, replacement scenarios, and target calculations.
