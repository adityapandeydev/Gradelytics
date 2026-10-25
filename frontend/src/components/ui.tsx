import {
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
} from "lucide-react";
import type { ReactNode } from "react";
import type { Course, GradingProfile } from "../lib/academics";
export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Select({
  label,
  value,
  onChange,
  children,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span className={`select-wrap ${className}`}>
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <ChevronDown size={14} aria-hidden="true" />
    </span>
  );
}
export function GradeBadge({
  label,
  profile,
}: {
  label: string;
  profile: GradingProfile;
}) {
  const outcome = profile.grades.find((g) => g.label === label)?.outcome;
  return (
    <span
      className={`grade-badge ${outcome === "fail" ? "grade-fail" : outcome === "pass" ? "grade-pass" : ""}`}
    >
      {label}
    </span>
  );
}
export function CourseTable({
  courses,
  profile,
  onGrade,
  compact = false,
}: {
  courses: Course[];
  profile: GradingProfile;
  onGrade?: (id: string, grade: string) => void;
  compact?: boolean;
}) {
  return (
    <div
      className="table-scroll"
      role="region"
      aria-label="Course records"
      tabIndex={0}
    >
      <table>
        <thead>
          <tr>
            <th>Course</th>
            {!compact && <th>Category</th>}
            <th>Credits</th>
            <th>Grade</th>
            <th>{compact ? "Status" : "Grade points"}</th>
          </tr>
        </thead>
        <tbody>
          {courses.map((c) => {
            const g = profile.grades.find((g) => g.label === c.grade);
            return (
              <tr key={c.id}>
                <td>
                  <div className="course-name">{c.name}</div>
                  <span className="course-code">
                    {c.code}
                    {c.credits === 0 ? " · Non-credit requirement" : ""}
                  </span>
                </td>
                {!compact && (
                  <td>
                    <span className="category">{c.category}</span>
                  </td>
                )}
                <td className="numeric">{c.credits}</td>
                <td>
                  {onGrade ? (
                    <Select
                      label={`Grade for ${c.name}`}
                      value={c.grade}
                      onChange={(v) => onGrade(c.id, v)}
                      className={`grade-select ${g?.outcome === "fail" ? "is-fail" : ""}`}
                    >
                      {profile.grades
                        .filter((g) =>
                          c.credits === 0
                            ? g.outcome === "pass" || g.outcome === "fail"
                            : g.outcome !== "pass",
                        )
                        .map((g) => (
                          <option key={g.label}>{g.label}</option>
                        ))}
                    </Select>
                  ) : (
                    <GradeBadge label={c.grade} profile={profile} />
                  )}
                </td>
                <td>
                  {compact ? (
                    <span
                      className={`status-label ${g?.outcome === "fail" ? "danger-text" : ""}`}
                    >
                      {g?.outcome === "fail" ? (
                        "To clear"
                      ) : (
                        <>
                          <Check size={13} aria-hidden="true" /> Completed
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="numeric muted">
                      {g?.outcome === "pass"
                        ? "Excluded"
                        : g?.points.toFixed(1)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {courses.length === 0 && (
        <div className="empty-state">
          No courses match your search. Try a course name or code.
        </div>
      )}
    </div>
  );
}
export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <button className="button secondary" onClick={onClick}>
      <ArrowDownToLine size={16} aria-hidden="true" />
      Export records
    </button>
  );
}
export function TextLink({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button className="text-link" onClick={onClick}>
      {children}
      <ArrowUpRight size={15} aria-hidden="true" />
    </button>
  );
}
