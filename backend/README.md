# Gradelytics calculation backend

First Go backend slice: a stateless, validated academic calculation API. Standard library only; Go 1.22 or newer. No database, credentials, or third-party Go dependencies are required.

```sh
go run ./cmd/api
```

The default listener is `127.0.0.1:8080`. `HTTP_ADDR` can override it. Liveness is available at `GET /healthz`. The frontend stays on its browser-local preview; it is not connected to these endpoints yet.

```sh
go test ./...
go vet ./...
go build ./...
```

See [API.md](API.md) for the request format, error contract, limits, and deferred capabilities. The engine supports configurable scale maxima and grade labels, four-place decimal inputs, inclusion/exclusion of failed credits, pass-only grades, zero-credit requirements, replacement scenarios, and target reachability.

Calculation inputs accumulate with fixed-point integers, with no premature GPA rounding. Outputs expose six decimal places of GPA precision. HTTP input is bounded and strictly decoded, responses never cache academic results, the server uses timeouts and graceful shutdown, and request bodies are not logged.

PostgreSQL persistence, accounts, ownership authorization, institution policy versions, and frontend integration are the next backend stages. Exam assessment formulas remain deferred.
