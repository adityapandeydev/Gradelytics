# Calculation API, first slice

The backend is a stateless Go service. It receives academic data for a calculation, validates it, and returns a result. It does not store student records, authenticate users, or connect to a database yet. The frontend uses browser-local records and sends calculation requests through Vite's same-origin `/api` proxy. It shows verified server results when available and explicitly labeled local estimates during pending or failed requests.

## Routes

- `GET /healthz` — process liveness, not database readiness.
- `POST /api/v1/calculations/gpa` — credit-weighted GPA and earned-credit summary.
- `POST /api/v1/calculations/improvement` — current and projected summaries using explicit grade replacement.
- `POST /api/v1/calculations/target` — required future average, maximum possible GPA, and reachability.

All API success responses use `{ "data": ... }`. Errors use `{ "error": { "code": "...", "message": "..." } }`. Unknown routes and unsupported methods also return JSON. Input must be one JSON object, `Content-Type: application/json`, at most 1 MiB, at most 2,000 courses and 64 grade mappings.

## Base request

```json
{
  "profile": {
    "maximum": 10,
    "failedCredits": "include",
    "grades": [
      { "label": "A", "points": 9, "outcome": "graded" },
      { "label": "F", "points": 0, "outcome": "fail" },
      { "label": "P", "outcome": "pass" }
    ]
  },
  "courses": [
    { "id": "cs101", "credits": 4, "grade": "A" },
    { "id": "cs102", "credits": 2, "grade": "F" },
    { "id": "ethics", "credits": 0, "grade": "P" }
  ]
}
```

Grade labels are configurable, unique, and case-sensitive. The scale maximum can be any positive decimal up to 100; 4, 5, 9, and 10 are ordinary configurations. Credits and points accept JSON numbers or decimal strings, with up to four decimal places and no exponent notation. Credits range from 0 to 100 per course. Fixed-point integer arithmetic preserves decimal inputs through accumulation. GPA outputs are rounded to six decimals for transport; display rounding belongs to the client.

`failedCredits` is `include` by default or `exclude`. Pass-only outcomes do not enter the GPA numerator or denominator, even if an institution awards credits for them. Zero-credit requirements remain represented in course counts and completion/backlog counts. A summary with no GPA-bearing credits returns `gpa: null`, never zero or NaN. Empty course arrays are valid.

## Improvements

Add `"overrides": { "cs102": "A" }` to the base request. The response includes `current`, `projected`, `gpaChange`, `coursesAffected`, and `policy: "replacement"`. Unknown course IDs, pass-only course changes, and invalid labels are rejected. Original records are never mutated. Attempt history and institution-specific repeat policies are later capabilities.

## Targets

Add `"target": 8.5, "futureCredits": 46` to the base request. The response includes `current`, `target`, `futureCredits`, `requiredAverage`, `maximumPossible`, and `reachable`. The unrounded requirement determines reachability, including cases near the scale maximum. A negative required average is preserved to explain that existing grade points already cover the target. Targets add new credits and do not replace old failures.

## Next backend slices

PostgreSQL persistence, versioned institution grading policies, course attempts, accounts, and ownership checks. Assessment/exam marking remains deferred. No database URL or credentials are needed to run the calculation service.
