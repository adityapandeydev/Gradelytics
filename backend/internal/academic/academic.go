package academic

import (
	"encoding/json"
	"fmt"
	"math"
	"strings"
)

type Grade struct {
	Label   string   `json:"label"`
	Points  *Decimal `json:"points,omitempty"`
	Outcome string   `json:"outcome"`
}
type Profile struct {
	Maximum       Decimal `json:"maximum"`
	Grades        []Grade `json:"grades"`
	FailedCredits string  `json:"failedCredits,omitempty"`
}
type Course struct {
	ID      string   `json:"id"`
	Credits *Decimal `json:"credits"`
	Grade   string   `json:"grade"`
}
type Request struct {
	Profile Profile  `json:"profile"`
	Courses []Course `json:"courses"`
}
type Summary struct {
	GPA                 *float64    `json:"gpa"`
	GPACredits          Decimal     `json:"gpaCredits"`
	EarnedCredits       Decimal     `json:"earnedCredits"`
	WeightedGradePoints json.Number `json:"weightedGradePoints"`
	Backlogs            int         `json:"backlogs"`
	CompletedCourses    int         `json:"completedCourses"`
	CourseCount         int         `json:"courseCount"`
}
type ImprovementRequest struct {
	Request
	Overrides map[string]string `json:"overrides"`
}
type ImprovementResult struct {
	Current         Summary  `json:"current"`
	Projected       Summary  `json:"projected"`
	GPAChange       *float64 `json:"gpaChange"`
	CoursesAffected int      `json:"coursesAffected"`
	Policy          string   `json:"policy"`
}
type TargetRequest struct {
	Request
	Target        Decimal `json:"target"`
	FutureCredits Decimal `json:"futureCredits"`
}
type TargetResult struct {
	Current         Summary `json:"current"`
	Target          Decimal `json:"target"`
	FutureCredits   Decimal `json:"futureCredits"`
	RequiredAverage float64 `json:"requiredAverage"`
	MaximumPossible float64 `json:"maximumPossible"`
	Reachable       bool    `json:"reachable"`
}

func validate(r Request) (map[string]Grade, error) {
	if r.Profile.Maximum <= 0 || r.Profile.Maximum > Decimal(100*scale) {
		return nil, fmt.Errorf("profile.maximum must be greater than zero and at most 100")
	}
	if len(r.Profile.Grades) == 0 || len(r.Profile.Grades) > 64 {
		return nil, fmt.Errorf("provide between 1 and 64 grade mappings")
	}
	if r.Profile.FailedCredits != "" && r.Profile.FailedCredits != "include" && r.Profile.FailedCredits != "exclude" {
		return nil, fmt.Errorf("profile.failedCredits must be include or exclude")
	}
	grades := make(map[string]Grade, len(r.Profile.Grades))
	for _, g := range r.Profile.Grades {
		if strings.TrimSpace(g.Label) == "" || strings.TrimSpace(g.Label) != g.Label || len(g.Label) > 32 {
			return nil, fmt.Errorf("grade labels must be nonblank, trimmed, and at most 32 bytes")
		}
		if _, exists := grades[g.Label]; exists {
			return nil, fmt.Errorf("duplicate grade label %q", g.Label)
		}
		switch g.Outcome {
		case "graded":
			if g.Points == nil || *g.Points < 0 || *g.Points > r.Profile.Maximum {
				return nil, fmt.Errorf("grade %q requires points within the selected scale", g.Label)
			}
		case "fail":
			if g.Points == nil || *g.Points != 0 {
				return nil, fmt.Errorf("failed grade %q requires zero points", g.Label)
			}
		case "pass":
			if g.Points != nil && *g.Points != 0 {
				return nil, fmt.Errorf("pass-only grade %q cannot carry grade points", g.Label)
			}
		default:
			return nil, fmt.Errorf("grade %q outcome must be graded, fail, or pass", g.Label)
		}
		grades[g.Label] = g
	}
	if len(r.Courses) > 2000 {
		return nil, fmt.Errorf("a calculation supports at most 2000 courses")
	}
	ids := make(map[string]bool, len(r.Courses))
	for _, c := range r.Courses {
		if strings.TrimSpace(c.ID) == "" || strings.TrimSpace(c.ID) != c.ID || len(c.ID) > 128 {
			return nil, fmt.Errorf("course ids must be nonblank, trimmed, and at most 128 bytes")
		}
		if ids[c.ID] {
			return nil, fmt.Errorf("duplicate course id %q", c.ID)
		}
		ids[c.ID] = true
		if c.Credits == nil || *c.Credits < 0 || *c.Credits > Decimal(100*scale) {
			return nil, fmt.Errorf("course %q requires credits between zero and 100", c.ID)
		}
		if _, exists := grades[c.Grade]; !exists {
			return nil, fmt.Errorf("course %q has an unknown grade", c.ID)
		}
	}
	return grades, nil
}

type accumulated struct {
	summary Summary
	points  int64
	credits int64
}

func accumulate(r Request, grades map[string]Grade) accumulated {
	var total accumulated
	total.summary.CourseCount = len(r.Courses)
	for _, c := range r.Courses {
		g := grades[c.Grade]
		if g.Outcome == "fail" {
			total.summary.Backlogs++
		} else {
			total.summary.EarnedCredits += *c.Credits
			total.summary.CompletedCourses++
		}
		if g.Outcome == "pass" || (g.Outcome == "fail" && r.Profile.FailedCredits == "exclude") {
			continue
		}
		total.credits += int64(*c.Credits)
		total.points += int64(*c.Credits) * int64(*g.Points)
	}
	total.summary.GPACredits = Decimal(total.credits)
	total.summary.WeightedGradePoints = json.Number(formatScaled(total.points, 8))
	if total.credits > 0 {
		gpa := round(float64(total.points) / float64(total.credits*scale))
		total.summary.GPA = &gpa
	}
	return total
}
func round(value float64) float64 { return math.Round(value*1e6) / 1e6 }
func Calculate(r Request) (Summary, error) {
	grades, err := validate(r)
	if err != nil {
		return Summary{}, err
	}
	return accumulate(r, grades).summary, nil
}
func Improve(r ImprovementRequest) (ImprovementResult, error) {
	grades, err := validate(r.Request)
	if err != nil {
		return ImprovementResult{}, err
	}
	if len(r.Overrides) > len(r.Courses) {
		return ImprovementResult{}, fmt.Errorf("overrides must reference existing courses")
	}
	copyRequest := Request{Profile: r.Profile, Courses: append([]Course(nil), r.Courses...)}
	matched := 0
	for i, c := range copyRequest.Courses {
		label, exists := r.Overrides[c.ID]
		if !exists {
			continue
		}
		g, valid := grades[label]
		if !valid || g.Outcome == "pass" || grades[c.Grade].Outcome == "pass" || *c.Credits == 0 {
			return ImprovementResult{}, fmt.Errorf("course %q requires a GPA-bearing grade replacement", c.ID)
		}
		copyRequest.Courses[i].Grade = label
		matched++
	}
	if matched != len(r.Overrides) {
		return ImprovementResult{}, fmt.Errorf("overrides contain unknown course ids")
	}
	current := accumulate(r.Request, grades)
	projected := accumulate(copyRequest, grades)
	result := ImprovementResult{Current: current.summary, Projected: projected.summary, CoursesAffected: matched, Policy: "replacement"}
	if current.credits > 0 && projected.credits > 0 {
		change := round(float64(projected.points)/float64(projected.credits*scale) - float64(current.points)/float64(current.credits*scale))
		result.GPAChange = &change
	}
	return result, nil
}
func PlanTarget(r TargetRequest) (TargetResult, error) {
	grades, err := validate(r.Request)
	if err != nil {
		return TargetResult{}, err
	}
	if r.Target < 0 || r.Target > r.Profile.Maximum {
		return TargetResult{}, fmt.Errorf("target must be within the selected grading scale")
	}
	if r.FutureCredits <= 0 || r.FutureCredits > Decimal(10000*scale) {
		return TargetResult{}, fmt.Errorf("futureCredits must be greater than zero and at most 10000")
	}
	total := accumulate(r.Request, grades)
	future := int64(r.FutureCredits)
	requiredNumerator := int64(r.Target)*(total.credits+future) - total.points
	maximumNumerator := int64(r.Profile.Maximum) * future
	return TargetResult{
		Current: total.summary, Target: r.Target, FutureCredits: r.FutureCredits,
		RequiredAverage: round(float64(requiredNumerator) / float64(future*scale)),
		MaximumPossible: round(float64(total.points+maximumNumerator) / float64((total.credits+future)*scale)),
		Reachable:       requiredNumerator <= maximumNumerator,
	}, nil
}
