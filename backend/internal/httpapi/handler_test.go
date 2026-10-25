package httpapi

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

const validBody = `{"profile":{"maximum":4,"grades":[{"label":"A-","points":3.7,"outcome":"graded"}]},"courses":[{"id":"cs1","credits":3,"grade":"A-"}]}`

func TestCalculationHTTP(t *testing.T) {
	handler := NewHandler()
	for _, tc := range []struct {
		name, method, path, body, contentType string
		status                                int
	}{
		{"health", "GET", "/healthz", "", "", 200},
		{"valid GPA", "POST", "/api/v1/calculations/gpa", validBody, "application/json", 200},
		{"invalid JSON", "POST", "/api/v1/calculations/gpa", "{", "application/json", 400},
		{"unknown field", "POST", "/api/v1/calculations/gpa", strings.Replace(validBody, `"maximum":4`, `"maximum":4,"typo":true`, 1), "application/json", 400},
		{"trailing JSON", "POST", "/api/v1/calculations/gpa", validBody + " {}", "application/json", 400},
		{"empty request", "POST", "/api/v1/calculations/gpa", "{}", "application/json", 422},
		{"unknown grade", "POST", "/api/v1/calculations/gpa", strings.Replace(validBody, `"grade":"A-"`, `"grade":"Z"`, 1), "application/json", 422},
		{"wrong content type", "POST", "/api/v1/calculations/gpa", validBody, "text/plain", 415},
		{"too large", "POST", "/api/v1/calculations/gpa", strings.Repeat(" ", maxBodyBytes+1), "application/json", 413},
		{"method", "GET", "/api/v1/calculations/gpa", "", "", 405},
		{"missing route", "GET", "/api/v1/nope", "", "", 404},
	} {
		t.Run(tc.name, func(t *testing.T) {
			r := httptest.NewRequest(tc.method, tc.path, strings.NewReader(tc.body))
			if tc.contentType != "" {
				r.Header.Set("Content-Type", tc.contentType)
			}
			w := httptest.NewRecorder()
			handler.ServeHTTP(w, r)
			if w.Code != tc.status {
				t.Fatalf("status %d, want %d: %s", w.Code, tc.status, w.Body.String())
			}
			if !strings.HasPrefix(w.Header().Get("Content-Type"), "application/json") {
				t.Fatal("response is not JSON")
			}
			var envelope map[string]json.RawMessage
			if err := json.Unmarshal(w.Body.Bytes(), &envelope); err != nil {
				t.Fatal(err)
			}
			if tc.status >= 400 && envelope["error"] == nil {
				t.Fatal("missing error envelope")
			}
			if w.Header().Get("X-Content-Type-Options") != "nosniff" {
				t.Fatal("missing nosniff header")
			}
		})
	}
}
func TestHTTPResults(t *testing.T) {
	w := httptest.NewRecorder()
	r := httptest.NewRequest(http.MethodPost, "/api/v1/calculations/gpa", strings.NewReader(validBody))
	r.Header.Set("Content-Type", "application/json")
	NewHandler().ServeHTTP(w, r)
	var result struct {
		Data struct {
			GPA float64 `json:"gpa"`
		}
	}
	if err := json.Unmarshal(w.Body.Bytes(), &result); err != nil || result.Data.GPA != 3.7 {
		t.Fatalf("incorrect result: %s (%v)", w.Body.String(), err)
	}
}

func TestPlanningEndpoints(t *testing.T) {
	for _, tc := range []struct {
		path, extra, key string
		want             float64
	}{
		{"improvement", `,"overrides":{"cs1":"A-"}`, "gpaChange", 0},
		{"target", `,"target":4,"futureCredits":3`, "requiredAverage", 4.3},
	} {
		t.Run(tc.path, func(t *testing.T) {
			body := strings.TrimSuffix(validBody, "}") + tc.extra + "}"
			r := httptest.NewRequest(http.MethodPost, "/api/v1/calculations/"+tc.path, strings.NewReader(body))
			r.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()
			NewHandler().ServeHTTP(w, r)
			if w.Code != 200 {
				t.Fatalf("%d: %s", w.Code, w.Body.String())
			}
			var result struct {
				Data map[string]json.RawMessage `json:"data"`
			}
			if err := json.Unmarshal(w.Body.Bytes(), &result); err != nil {
				t.Fatal(err)
			}
			var got float64
			if err := json.Unmarshal(result.Data[tc.key], &got); err != nil || got != tc.want {
				t.Fatalf("wrong planning result: %s", w.Body.String())
			}
		})
	}
}
