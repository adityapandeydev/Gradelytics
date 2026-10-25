package academic

import (
	"encoding/json"
	"errors"
	"regexp"
	"strconv"
	"strings"
)

const scale int64 = 10000

// Decimal stores four fractional digits exactly. Bounds are enforced at domain boundaries.
type Decimal int64

var decimalPattern = regexp.MustCompile(`^-?(0|[1-9][0-9]*)(\.[0-9]{1,4})?$`)

func ParseDecimal(text string) (Decimal, error) {
	if len(text) > 24 || !decimalPattern.MatchString(text) {
		return 0, errors.New("use a plain decimal with at most four fractional digits")
	}
	negative := strings.HasPrefix(text, "-")
	text = strings.TrimPrefix(text, "-")
	parts := strings.SplitN(text, ".", 2)
	fraction := ""
	if len(parts) == 2 {
		fraction = parts[1]
	}
	units, err := strconv.ParseInt(parts[0]+fraction+strings.Repeat("0", 4-len(fraction)), 10, 64)
	if err != nil {
		return 0, errors.New("decimal exceeds supported range")
	}
	if negative {
		units = -units
	}
	return Decimal(units), nil
}
func (d *Decimal) UnmarshalJSON(raw []byte) error {
	text := string(raw)
	if len(raw) > 0 && raw[0] == '"' {
		if err := json.Unmarshal(raw, &text); err != nil {
			return err
		}
	}
	parsed, err := ParseDecimal(text)
	if err != nil {
		return err
	}
	*d = parsed
	return nil
}
func (d Decimal) MarshalJSON() ([]byte, error) { return []byte(formatScaled(int64(d), 4)), nil }

func formatScaled(value int64, places int) string {
	negative := value < 0
	if negative {
		value = -value
	}
	digits := strconv.FormatInt(value, 10)
	if len(digits) <= places {
		digits = strings.Repeat("0", places-len(digits)+1) + digits
	}
	index := len(digits) - places
	text := strings.TrimRight(strings.TrimRight(digits[:index]+"."+digits[index:], "0"), ".")
	if negative && value != 0 {
		text = "-" + text
	}
	return text
}
