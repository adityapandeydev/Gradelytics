package academic

import (
	"encoding/json"
	"math"
	"strings"
	"testing"
)

func number(t *testing.T, value string) Decimal {
	t.Helper()
	d, err := ParseDecimal(value)
	if err != nil {
		t.Fatal(err)
	}
	return d
}
func fixture(t *testing.T) Request {
	t.Helper()
	var request Request
	err := json.Unmarshal([]byte(`{"profile":{"maximum":10,"failedCredits":"include","grades":[{"label":"S","points":10,"outcome":"graded"},{"label":"A","points":9,"outcome":"graded"},{"label":"F","points":0,"outcome":"fail"},{"label":"P","outcome":"pass"}]},"courses":[{"id":"theory","credits":4,"grade":"A"},{"id":"failed","credits":2,"grade":"F"},{"id":"ethics","credits":0,"grade":"P"}]}`), &request)
	if err != nil {
		t.Fatal(err)
	}
	return request
}
func TestCreditWeightingAndFailurePolicy(t *testing.T) {
	r := fixture(t)
	result, err := Calculate(r)
	if err != nil {
		t.Fatal(err)
	}
	if result.GPA == nil || *result.GPA != 6 || result.EarnedCredits != number(t, "4") || result.GPACredits != number(t, "6") || result.Backlogs != 1 {
		t.Fatalf("unexpected summary: %+v", result)
	}
	r.Profile.FailedCredits = "exclude"
	result, err = Calculate(r)
	if err != nil || result.GPA == nil || *result.GPA != 9 {
		t.Fatalf("excluded failure: %+v, %v", result, err)
	}
}
func TestPassOnlyRecordHasNoGPA(t *testing.T) {
	r := fixture(t)
	r.Courses = r.Courses[2:]
	result, err := Calculate(r)
	if err != nil || result.GPA != nil || result.GPACredits != 0 {
		t.Fatalf("unexpected: %+v, %v", result, err)
	}
}
func TestImprovementReplacesWithoutDuplicatingCredits(t *testing.T) {
	r := fixture(t)
	result, err := Improve(ImprovementRequest{Request: r, Overrides: map[string]string{"failed": "S"}})
	if err != nil {
		t.Fatal(err)
	}
	if result.Projected.GPA == nil || math.Abs(*result.Projected.GPA-9.333333) > 0.000001 || result.Projected.GPACredits != number(t, "6") || result.Projected.Backlogs != 0 {
		t.Fatalf("unexpected: %+v", result)
	}
	if r.Courses[1].Grade != "F" {
		t.Fatal("improvement mutated original record")
	}
	_, err = Improve(ImprovementRequest{Request: r, Overrides: map[string]string{"missing": "S"}})
	if err == nil {
		t.Fatal("accepted unknown course")
	}
}
func TestDecimalGradesAndCreditsStayExact(t *testing.T) {
	var r Request
	err := json.Unmarshal([]byte(`{"profile":{"maximum":4,"grades":[{"label":"A-","points":3.7,"outcome":"graded"}]},"courses":[{"id":"a","credits":0.1,"grade":"A-"},{"id":"b","credits":0.2,"grade":"A-"}]}`), &r)
	if err != nil {
		t.Fatal(err)
	}
	result, err := Calculate(r)
	if err != nil || result.GPA == nil || *result.GPA != 3.7 || result.GPACredits != number(t, "0.3") || result.WeightedGradePoints.String() != "1.11" {
		t.Fatalf("unexpected: %+v, %v", result, err)
	}
}
func TestTargetIdentifiesImpossibleGoal(t *testing.T) {
	r := fixture(t)
	result, err := PlanTarget(TargetRequest{Request: r, Target: number(t, "10"), FutureCredits: number(t, "2")})
	if err != nil || result.RequiredAverage != 22 || result.Reachable || result.MaximumPossible != 7 {
		t.Fatalf("unexpected: %+v, %v", result, err)
	}
}
func TestValidation(t *testing.T) {
	for _, tc := range []struct {
		name   string
		mutate func(*Request)
	}{
		{"unknown grade", func(r *Request) { r.Courses[0].Grade = "X" }},
		{"missing credits", func(r *Request) { r.Courses[0].Credits = nil }},
		{"duplicate id", func(r *Request) { r.Courses[1].ID = r.Courses[0].ID }},
		{"blank id", func(r *Request) { r.Courses[0].ID = " " }},
		{"duplicate grade", func(r *Request) { r.Profile.Grades = append(r.Profile.Grades, r.Profile.Grades[0]) }},
		{"invalid maximum", func(r *Request) { r.Profile.Maximum = 0 }},
		{"invalid failure policy", func(r *Request) { r.Profile.FailedCredits = "sometimes" }},
		{"invalid pass points", func(r *Request) { r.Profile.Grades[3].Points = r.Profile.Grades[0].Points }},
		{"negative credits", func(r *Request) { v := number(t, "-1"); r.Courses[0].Credits = &v }},
		{"oversized id", func(r *Request) { r.Courses[0].ID = strings.Repeat("x", 129) }},
	} {
		t.Run(tc.name, func(t *testing.T) {
			r := fixture(t)
			tc.mutate(&r)
			if _, err := Calculate(r); err == nil {
				t.Fatal("accepted invalid request")
			}
		})
	}
}
func TestDecimalRejectsExcessPrecision(t *testing.T) {
	for _, input := range []string{"0.00001", "NaN", "1e20", "", "+1", "999999999999999999999999999"} {
		if _, err := ParseDecimal(input); err == nil {
			t.Errorf("accepted %q", input)
		}
	}
	d := number(t, "3.7000")
	encoded, err := json.Marshal(d)
	if err != nil || string(encoded) != "3.7" {
		t.Fatalf("unexpected decimal encoding %s, %v", encoded, err)
	}
}

func TestScaleConfigurations(t *testing.T) {
	for _, tc := range []struct {
		maximum, points string
		want            float64
	}{{"4", "3.5", 3.5}, {"5", "4.5", 4.5}, {"9", "8.5", 8.5}, {"10", "9.5", 9.5}} {
		t.Run(tc.maximum, func(t *testing.T) {
			points, credits := number(t, tc.points), number(t, "1.5")
			r := Request{Profile: Profile{Maximum: number(t, tc.maximum), Grades: []Grade{{Label: "A+", Points: &points, Outcome: "graded"}}}, Courses: []Course{{ID: "cs", Credits: &credits, Grade: "A+"}}}
			result, err := Calculate(r)
			if err != nil || result.GPA == nil || *result.GPA != tc.want {
				t.Fatalf("unexpected result %+v, %v", result, err)
			}
		})
	}
}

func TestPassCreditsAreEarnedButExcludedFromGPA(t *testing.T) {
	r := fixture(t)
	credits := number(t, "2")
	r.Courses[2].Credits = &credits
	result, err := Calculate(r)
	if err != nil || result.EarnedCredits != number(t, "6") || result.GPACredits != number(t, "6") || result.GPA == nil || *result.GPA != 6 {
		t.Fatalf("unexpected result %+v, %v", result, err)
	}
}

func TestReachabilityDoesNotUseRoundedOutput(t *testing.T) {
	points, credits := number(t, "3.9999"), number(t, "0.0001")
	r := Request{Profile: Profile{Maximum: number(t, "4"), Grades: []Grade{{Label: "A", Points: &points, Outcome: "graded"}}}, Courses: []Course{{ID: "cs", Credits: &credits, Grade: "A"}}}
	result, err := PlanTarget(TargetRequest{Request: r, Target: number(t, "4"), FutureCredits: number(t, "10000")})
	if err != nil || result.Reachable {
		t.Fatalf("must remain unreachable before rounding: %+v, %v", result, err)
	}
}
