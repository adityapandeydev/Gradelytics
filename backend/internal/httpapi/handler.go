package httpapi

import (
	"encoding/json"
	"errors"
	"io"
	"log/slog"
	"mime"
	"net/http"

	"gradelytics/backend/internal/academic"
)

const maxBodyBytes = 1 << 20

type apiError struct {
	Code    string `json:"code"`
	Message string `json:"message"`
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		slog.Debug("response write ended", "status", status)
	}
}
func fail(w http.ResponseWriter, status int, code, message string) {
	writeJSON(w, status, struct {
		Error apiError `json:"error"`
	}{apiError{Code: code, Message: message}})
}

func readJSON(w http.ResponseWriter, r *http.Request, destination any) bool {
	contentType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if err != nil || contentType != "application/json" {
		fail(w, http.StatusUnsupportedMediaType, "UNSUPPORTED_MEDIA_TYPE", "Send Content-Type: application/json.")
		return false
	}
	r.Body = http.MaxBytesReader(w, r.Body, maxBodyBytes)
	defer r.Body.Close()
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	err = decoder.Decode(destination)
	if err == nil {
		var extra any
		err = decoder.Decode(&extra)
		if errors.Is(err, io.EOF) {
			return true
		}
	}
	var sizeError *http.MaxBytesError
	if errors.As(err, &sizeError) {
		fail(w, http.StatusRequestEntityTooLarge, "PAYLOAD_TOO_LARGE", "Request bodies must be at most 1 MiB.")
	} else {
		fail(w, http.StatusBadRequest, "INVALID_JSON", "Send one valid JSON object with supported fields and decimals with at most four fractional digits.")
	}
	return false
}

// calculation keeps HTTP validation separate from the pure academic engine.
func calculation[Input any, Output any](calculate func(Input) (Output, error)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var input Input
		if !readJSON(w, r, &input) {
			return
		}
		output, err := calculate(input)
		if err != nil {
			fail(w, http.StatusUnprocessableEntity, "VALIDATION_ERROR", err.Error())
			return
		}
		writeJSON(w, http.StatusOK, struct {
			Data Output `json:"data"`
		}{output})
	}
}

func NewHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, r *http.Request) {
		writeJSON(w, http.StatusOK, struct {
			Data map[string]string `json:"data"`
		}{map[string]string{"status": "ok", "service": "gradelytics-calculations"}})
	})
	mux.HandleFunc("POST /api/v1/calculations/gpa", calculation(academic.Calculate))
	mux.HandleFunc("POST /api/v1/calculations/improvement", calculation(academic.Improve))
	mux.HandleFunc("POST /api/v1/calculations/target", calculation(academic.PlanTarget))
	methods := map[string]string{"/healthz": "GET, HEAD", "/api/v1/calculations/gpa": "POST", "/api/v1/calculations/improvement": "POST", "/api/v1/calculations/target": "POST"}
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if allowed, exists := methods[r.URL.Path]; exists {
			w.Header().Set("Allow", allowed)
			fail(w, http.StatusMethodNotAllowed, "METHOD_NOT_ALLOWED", "Use the HTTP method documented for this endpoint.")
			return
		}
		fail(w, http.StatusNotFound, "NOT_FOUND", "No API endpoint matches this path.")
	})
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("Cache-Control", "no-store")
		w.Header().Set("Referrer-Policy", "no-referrer")
		defer func() {
			if recovered := recover(); recovered != nil {
				slog.Error("request panic", "method", r.Method, "path", r.URL.Path)
				fail(w, http.StatusInternalServerError, "INTERNAL_ERROR", "The calculation could not be completed.")
			}
		}()
		mux.ServeHTTP(w, r)
	})
}
