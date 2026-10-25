import { useRef, useState } from "react";
import type { Dispatch, FormEvent, SetStateAction } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCheck,
  CircleAlert,
  FlaskConical,
  GraduationCap,
  Info,
  Plus,
  RotateCcw,
  Save,
  Search,
  SlidersHorizontal,
  Target,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { csvExport, requiredAverage, summarize } from "../lib/academics";
import type { Course, GradingProfile } from "../lib/academics";
import { useStoredState } from "../lib/useStoredState";
import { useCalculation } from "../lib/useCalculation";
import { CalculationStatus } from "./CalculationStatus";
import {
  CourseTable,
  ExportButton,
  GradeBadge,
  SectionHeading,
  Select,
  TextLink,
} from "./ui";
import { downloadFile } from "../lib/files";

type Page =
  | "overview"
  | "records"
  | "simulator"
  | "goals"
  | "curriculum"
  | "attendance"
  | "planner"
  | "settings";
interface Shared {
  courses: Course[];
  profile: GradingProfile;
  navigate: (page: Page) => void;
  notify: (message: string) => void;
}
type SetCourses = (
  update: Course[] | ((previous: Course[]) => Course[]),
) => void;
function PageHeading({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <h1>
          {title}
          <span>.</span>
        </h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="info-note">
      <Info size={17} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

export function Records({
  courses,
  profile,
  setCourses,
  changeGrade,
  notify,
  search,
  setSearch,
}: Shared & {
  setCourses: SetCourses;
  changeGrade: (id: string, value: string) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const [semester, setSemester] = useState("6");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState({
    name: "",
    code: "",
    credits: "3",
    grade: profile.grades[0].label,
    semester: "6",
    category: "Core",
  });
  const filtered = courses.filter(
    (c) =>
      (semester === "all" || c.semester === Number(semester)) &&
      `${c.name} ${c.code}`.toLowerCase().includes(search.toLowerCase()),
  );
  const semesterCourses = courses.filter(
    (c) => semester === "all" || c.semester === Number(semester),
  );
  const calculation = useCalculation("gpa", {
    courses: semesterCourses,
    profile,
  });
  const totals = calculation.data ?? summarize(semesterCourses, profile);
  function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (!draft.name.trim() || !draft.code.trim()) {
      setError("Enter a course name and code; spaces alone cannot be saved.");
      return;
    }
    if (
      courses.some(
        (c) =>
          c.code.toLowerCase() === draft.code.trim().toLowerCase() &&
          c.semester === Number(draft.semester),
      )
    ) {
      setError("That course code already exists in this semester.");
      return;
    }
    const grade = Number(draft.credits) === 0 ? "P" : draft.grade;
    setCourses((previous) => [
      ...previous,
      {
        ...draft,
        id: crypto.randomUUID(),
        name: draft.name.trim(),
        code: draft.code.trim().toUpperCase(),
        credits: Number(draft.credits),
        grade,
        semester: Number(draft.semester),
        attended: 0,
        held: 0,
      },
    ]);
    setAdding(false);
    setSemester(draft.semester);
    setDraft({ ...draft, name: "", code: "" });
    notify("Course added to your local academic record.");
  }
  async function importFile(file: File) {
    try {
      if (file.size > 1024 * 1024)
        throw new Error("Use a CSV smaller than 1 MB.");
      const rows = parseCSV(await file.text());
      const header = rows.shift()?.map((v) => v.trim().toLowerCase());
      if (
        !header ||
        ["code", "name", "semester", "credits", "grade", "category"].some(
          (h, i) => header[i] !== h,
        )
      )
        throw new Error("Use the six-column CSV format from Export records.");
      const imported: Course[] = rows
        .filter((r) => r.some(Boolean))
        .map((r, i) => {
          const credits = Number(r[3]),
            sem = Number(r[2]);
          const g = profile.grades.find((g) => g.label === r[4]);
          if (
            r.length !== 6 ||
            !r[0]?.trim() ||
            !r[1]?.trim() ||
            !r[2]?.trim() ||
            !r[3]?.trim() ||
            !Number.isFinite(credits) ||
            credits < 0 ||
            credits > 30 ||
            !Number.isInteger(sem) ||
            sem < 1 ||
            sem > 12 ||
            !g ||
            (credits > 0 && g.outcome === "pass") ||
            (credits === 0 && g.outcome === "graded")
          )
            throw new Error(
              `Check the values in CSV row ${i + 2}; grades must match this profile.`,
            );
          return {
            id: crypto.randomUUID(),
            code: r[0].trim().toUpperCase(),
            name: r[1].trim(),
            semester: sem,
            credits,
            grade: r[4],
            category: r[5],
            held: 0,
            attended: 0,
          };
        });
      if (!imported.length) throw new Error("No course rows found in the CSV.");
      const keys = new Set(
        courses.map((c) => `${c.semester}-${c.code.toLowerCase()}`),
      );
      for (const c of imported) {
        const key = `${c.semester}-${c.code.toLowerCase()}`;
        if (keys.has(key))
          throw new Error(
            `Course ${c.code} already exists in semester ${c.semester}. No rows were imported.`,
          );
        keys.add(key);
      }
      setCourses((previous) => [...previous, ...imported]);
      setSemester("all");
      setError("");
      notify(
        `Imported ${imported.length} courses. Existing records were preserved.`,
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not read this CSV.",
      );
    }
  }
  return (
    <>
      <PageHeading
        title="Your academic record"
        description="Every course, every semester. All in one place."
      >
        <div className="button-group">
          <ExportButton
            onClick={() =>
              downloadFile(csvExport(courses), "gradelytics-records.csv")
            }
          />
          <button className="button primary" onClick={() => setAdding(!adding)}>
            {adding ? <X size={16} /> : <Plus size={16} />}{" "}
            {adding ? "Cancel" : "Add course"}
          </button>
        </div>
      </PageHeading>
      <Note>
        These are sample records. Edit grades to explore the interface. Changes
        are saved in this browser.
      </Note>
      {adding && (
        <form className="panel inline-form" onSubmit={add}>
          <SectionHeading
            title="Add a course"
            subtitle="Zero-credit courses are recorded as pass-only requirements."
          />
          <div className="form-grid">
            <label>
              Course name
              <input
                required
                maxLength={100}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                placeholder="e.g. Data Structures"
              />
            </label>
            <label>
              Course code
              <input
                required
                maxLength={20}
                value={draft.code}
                onChange={(e) => setDraft({ ...draft, code: e.target.value })}
                placeholder="e.g. CS201"
              />
            </label>
            <label>
              Semester
              <input
                required
                type="number"
                min="1"
                max="12"
                value={draft.semester}
                onChange={(e) =>
                  setDraft({ ...draft, semester: e.target.value })
                }
              />
            </label>
            <label>
              Credits
              <input
                required
                type="number"
                min="0"
                max="30"
                step="0.5"
                value={draft.credits}
                onChange={(e) =>
                  setDraft({ ...draft, credits: e.target.value })
                }
              />
            </label>
            <label>
              Grade
              <Select
                label="New course grade"
                value={Number(draft.credits) === 0 ? "P" : draft.grade}
                onChange={(grade) => setDraft({ ...draft, grade })}
              >
                {profile.grades
                  .filter((g) =>
                    Number(draft.credits) === 0
                      ? g.outcome === "pass"
                      : g.outcome !== "pass",
                  )
                  .map((g) => (
                    <option key={g.label}>{g.label}</option>
                  ))}
              </Select>
            </label>
            <label>
              Category
              <Select
                label="Course category"
                value={draft.category}
                onChange={(category) => setDraft({ ...draft, category })}
              >
                {["Core", "Elective", "Lab", "Mandatory"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </Select>
            </label>
          </div>
          <button className="button primary" type="submit">
            Save course
            <Check size={16} />
          </button>
        </form>
      )}
      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      <CalculationStatus state={calculation} />
      <div className="record-summary">
        <span>
          {semester === "all" ? "Cumulative GPA" : "Semester GPA"}
          <strong>
            {totals.gpa?.toFixed(2) ?? "—"}
            <small> / {profile.max}</small>
          </strong>
        </span>
        <span>
          Credits earned<strong>{totals.earned}</strong>
        </span>
        <span>
          Courses recorded
          <strong>
            {
              courses.filter(
                (c) => semester === "all" || c.semester === Number(semester),
              ).length
            }
          </strong>
        </span>
        <span>
          Grading profile
          <strong className="summary-label">{profile.name}</strong>
        </span>
      </div>
      <section className="panel">
        <div className="record-controls">
          <div className="semester-tabs" aria-label="Semester filter">
            {[
              "all",
              ...Array.from(
                new Set(courses.map((c) => String(c.semester))),
              ).sort((a, b) => Number(a) - Number(b)),
            ].map((s) => (
              <button
                key={s}
                className={semester === s ? "selected" : ""}
                onClick={() => setSemester(s)}
                aria-pressed={semester === s}
              >
                {s === "all" ? "All semesters" : `Sem ${s}`}
              </button>
            ))}
          </div>
        </div>
        <div className="table-toolbar">
          <label className="search-input">
            <Search size={16} aria-hidden="true" />
            <input
              aria-label="Search courses"
              placeholder="Find a course or code…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
          <button
            className="button subtle"
            onClick={() => fileRef.current?.click()}
          >
            <Upload size={15} />
            Import CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            hidden
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void importFile(file);
              e.target.value = "";
            }}
          />
        </div>
        <CourseTable
          courses={filtered}
          profile={profile}
          onGrade={changeGrade}
        />
        <div className="table-bottom">
          <span>{filtered.length} courses · Grades can be edited directly</span>
          <span>Weighted by course credits</span>
        </div>
      </section>
      <p className="supporting-copy">
        CSV imports append new courses. Export your records for the supported
        format; PDF and screenshot imports will come later.
      </p>
    </>
  );
}
function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    field = "",
    quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"';
        i++;
      } else quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (quoted)
    throw new Error(
      "The CSV contains an unclosed quote. Export it again and retry.",
    );
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

export function Simulator({ courses, profile, notify }: Shared) {
  const failed = courses.find(
    (c) =>
      profile.grades.find((g) => g.label === c.grade)?.outcome === "fail" &&
      c.credits > 0,
  );
  const [overrides, setOverrides] = useState<Record<string, string>>(
    failed ? { [failed.id]: profile.grades[0].label } : {},
  );
  const [saved, setSaved] = useStoredState<
    { name: string; overrides: Record<string, string> }[]
  >(`gradelytics-scenarios-${profile.id}-v1`, []);
  const [name, setName] = useState("My next best move");
  const calculation = useCalculation("improvement", {
    courses,
    profile,
    overrides,
  });
  const current = calculation.data?.current ?? summarize(courses, profile);
  const projected =
    calculation.data?.projected ?? summarize(courses, profile, overrides);
  const delta = calculation.data
    ? calculation.data.gpaChange
    : current.gpa !== null && projected.gpa !== null
      ? projected.gpa - current.gpa
      : null;
  const eligible = courses.filter((c) => c.credits > 0);
  const selected = Object.keys(overrides)
    .map((id) => eligible.find((c) => c.id === id))
    .filter((c): c is Course => !!c);
  const available = eligible.filter((c) => !(c.id in overrides));
  return (
    <>
      <PageHeading
        title="A different grade. A new possibility"
        description="Explore improvements without changing your actual academic record."
      >
        <span className="pill">
          <FlaskConical size={15} />
          What-if workspace
        </span>
      </PageHeading>
      <CalculationStatus state={calculation} />
      <div className="workspace-grid">
        <section className="panel simulator-editor">
          <SectionHeading
            title="Let’s change the picture"
            subtitle="Choose a course and the grade you’d like to work toward."
            action={
              <button
                className="icon-button"
                aria-label="Reset scenario"
                onClick={() => setOverrides({})}
              >
                <RotateCcw size={17} />
              </button>
            }
          />
          <div className="scenario-rows">
            {selected.map((c) => (
              <div className="scenario-row" key={c.id}>
                <div className="scenario-course">
                  <strong>{c.name}</strong>
                  <span>
                    {c.code} · Sem {c.semester} · {c.credits} credits
                  </span>
                </div>
                <div className="grade-change">
                  <GradeBadge label={c.grade} profile={profile} />
                  <ArrowRight size={16} aria-hidden="true" />
                  <Select
                    label={`Projected grade for ${c.name}`}
                    value={overrides[c.id]}
                    onChange={(value) =>
                      setOverrides({ ...overrides, [c.id]: value })
                    }
                  >
                    {profile.grades
                      .filter((g) => g.outcome !== "pass")
                      .map((g) => (
                        <option key={g.label}>{g.label}</option>
                      ))}
                  </Select>
                  <button
                    className="icon-button"
                    aria-label={`Remove ${c.name} from scenario`}
                    onClick={() =>
                      setOverrides(
                        Object.fromEntries(
                          Object.entries(overrides).filter(
                            ([id]) => id !== c.id,
                          ),
                        ),
                      )
                    }
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
          {!selected.length && (
            <div className="empty-state">
              <FlaskConical size={28} />
              <h3>A fresh canvas for your next move.</h3>
              <p>Add a course below to explore a different outcome.</p>
            </div>
          )}
          <label className="add-scenario-label">
            Add a course to this scenario
            <Select
              label="Add a course to scenario"
              value=""
              onChange={(id) => {
                if (id)
                  setOverrides({ ...overrides, [id]: profile.grades[0].label });
              }}
            >
              <option value="">Choose from your academic record…</option>
              {available.map((c) => (
                <option value={c.id} key={c.id}>
                  {c.name} · Sem {c.semester} · {c.grade}
                </option>
              ))}
            </Select>
          </label>
          <Note>
            Preview policy: the new grade replaces the original grade. Credits
            are counted once. Your university’s improvement rules may differ.
          </Note>
          <div className="save-scenario">
            <label>
              Scenario name
              <input
                value={name}
                maxLength={45}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <button
              className="button primary"
              disabled={!selected.length || !name.trim()}
              onClick={() => {
                setSaved((previous) => [
                  ...previous,
                  { name: name.trim(), overrides },
                ]);
                notify("Scenario saved in this browser.");
              }}
            >
              <Save size={16} />
              Save scenario
            </button>
          </div>
        </section>
        <aside className="projection-panel">
          <span className="projection-label">THE POSSIBLE PICTURE</span>
          <h2>
            A little change can
            <br />
            go a long way.
          </h2>
          <div className="comparison">
            <div>
              <span>Current CGPA</span>
              <strong>{current.gpa?.toFixed(2) ?? "—"}</strong>
            </div>
            <ArrowRight size={22} />
            <div>
              <span>Projected CGPA</span>
              <strong>{projected.gpa?.toFixed(2) ?? "—"}</strong>
            </div>
          </div>
          <div className={`delta-badge ${(delta ?? 0) < 0 ? "negative" : ""}`}>
            <ArrowUpRight size={19} />
            {delta === null
              ? "GPA change unavailable"
              : `${delta >= 0 ? "+" : ""}${delta.toFixed(2)} CGPA change`}
          </div>
          <div className="projection-details">
            <span>
              Courses in this scenario<strong>{selected.length}</strong>
            </span>
            <span>
              Credits affected
              <strong>{selected.reduce((s, c) => s + c.credits, 0)}</strong>
            </span>
            <span>
              Remaining backlogs<strong>{projected.backlogs}</strong>
            </span>
          </div>
          <p>
            These are possibilities, not promises. Your next step is yours to
            choose.
          </p>
        </aside>
      </div>
      <section className="panel saved-scenarios">
        <SectionHeading
          title="Possibilities worth keeping"
          subtitle="Come back to a plan. Compare a different path."
        />
        {!saved.length ? (
          <p className="muted">Your saved scenarios will appear here.</p>
        ) : (
          saved.map((s, i) => (
            <div className="saved-row" key={i}>
              <span>
                <strong>{s.name}</strong>
                <small>
                  {Object.keys(s.overrides).length} course changes · Projected{" "}
                  {summarize(courses, profile, s.overrides).gpa?.toFixed(2)}{" "}
                  CGPA
                </small>
              </span>
              <button
                className="button secondary"
                onClick={() => {
                  setOverrides(s.overrides);
                  setName(s.name);
                  notify("Scenario loaded.");
                }}
              >
                Explore
                <ArrowUpRight size={15} />
              </button>
              <button
                className="icon-button"
                aria-label={`Delete scenario ${s.name}`}
                onClick={() =>
                  setSaved((previous) =>
                    previous.filter((_, index) => i !== index),
                  )
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        )}
      </section>
    </>
  );
}

export function Goals({ courses, profile, navigate }: Shared) {
  const localTotals = summarize(courses, profile);
  const [target, setTarget] = useState(() =>
    Number((profile.max * 0.85).toFixed(4)),
  );
  const [remaining, setRemaining] = useState(
    Math.max(1, 160 - localTotals.credits),
  );
  const [semesters, setSemesters] = useState(2);
  const calculation = useCalculation("target", {
    courses,
    profile,
    target,
    futureCredits: remaining,
  });
  const totals = calculation.data?.current ?? localTotals;
  const required =
    calculation.data?.requiredAverage ??
    requiredAverage(localTotals.points, localTotals.credits, remaining, target);
  const reachable =
    calculation.data?.reachable ??
    (required !== null && required <= profile.max);
  const maxPossible =
    calculation.data?.maximumPossible ??
    (localTotals.points + remaining * profile.max) /
      (localTotals.credits + remaining);
  return (
    <>
      <PageHeading
        title="Give your ambition a direction"
        description="Work backward from your goal. Find a path that feels possible."
      />
      <CalculationStatus state={calculation} />
      <div className="workspace-grid">
        <section className="panel goal-editor">
          <SectionHeading
            title="Where would you like to be?"
            subtitle={`You’re starting at ${totals.gpa?.toFixed(2) ?? "—"} on a ${profile.max}-point scale.`}
          />
          <div className="target-input-row">
            <label htmlFor="target-input">Target cumulative GPA</label>
            <div>
              <input
                id="target-input"
                type="number"
                min="0"
                max={profile.max}
                step="0.01"
                value={target}
                onChange={(e) =>
                  setTarget(
                    Math.min(profile.max, Math.max(0, Number(e.target.value))),
                  )
                }
              />
              <span>/ {profile.max}</span>
            </div>
          </div>
          <input
            aria-label="Adjust target GPA"
            className="range-input"
            type="range"
            min="0"
            max={profile.max}
            step="0.01"
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
          />
          <div className="range-labels">
            <span>0.00</span>
            <span>{profile.max.toFixed(2)}</span>
          </div>
          <div className="form-grid two-columns">
            <label>
              Future GPA-bearing credits
              <input
                type="number"
                min="1"
                max="300"
                required
                value={remaining}
                onChange={(e) =>
                  setRemaining(
                    Math.min(300, Math.max(1, Number(e.target.value))),
                  )
                }
              />
            </label>
            <label>
              Semesters to plan
              <input
                type="number"
                min="1"
                max="12"
                required
                value={semesters}
                onChange={(e) =>
                  setSemesters(
                    Math.min(12, Math.max(1, Number(e.target.value))),
                  )
                }
              />
            </label>
          </div>
          <Note>
            This plan adds future credits to your existing record. It assumes
            the same grading scale and does not replace failed attempts. Use the
            simulator for improvements.
          </Note>
        </section>
        <section className="projection-panel target-result">
          <Target size={30} />
          <h2>
            {reachable
              ? "Your goal has a path."
              : "Let’s find a different path."}
          </h2>
          <p>
            {reachable
              ? "Average GPA needed across your planned credits"
              : "This target needs an average above your grading scale"}
          </p>
          <div className="required-value">
            {Math.max(0, required ?? 0).toFixed(2)}
            <span>/ {profile.max}</span>
          </div>
          <div className="delta-badge">
            {reachable
              ? "Mathematically achievable"
              : "Beyond the selected scale"}
          </div>
          <p>
            {required !== null && required < 0
              ? "Your existing grade points already cover this target, even with zero future grade points."
              : `${remaining} credits across ${semesters} semesters · approximately ${(remaining / semesters).toFixed(1)} credits per semester.`}
          </p>
          <div className="result-footnote">
            With the highest possible grades, you could reach{" "}
            <strong>{maxPossible.toFixed(2)}</strong> CGPA.
          </div>
          <button
            className="button goal-button"
            onClick={() => navigate("simulator")}
          >
            Explore grade improvements
            <ArrowRight size={16} />
          </button>
        </section>
      </div>
      <section className="panel path-panel">
        <SectionHeading
          title="A plan, one semester at a time"
          subtitle="Illustrative equal-credit allocation. Adjust your plan above to explore."
        />
        <div className="semester-path">
          {Array.from({ length: semesters }, (_, i) => (
            <div key={i}>
              <span className="path-step">{i + 1}</span>
              <h3>Planned semester {i + 1}</h3>
              <p>{(remaining / semesters).toFixed(1)} credits</p>
              <strong>
                {reachable
                  ? Math.max(0, required ?? 0).toFixed(2)
                  : "Revise target"}
                <small>{reachable ? " GPA needed" : ""}</small>
              </strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

export function Curriculum({ courses, profile, navigate }: Shared) {
  const totals = summarize(courses, profile);
  const requirements = [
    { name: "Core courses", category: "Core", required: 112 },
    {
      name: "Open & professional electives",
      category: "Elective",
      required: 24,
    },
    { name: "Laboratories", category: "Lab", required: 16 },
    { name: "Project & internship", category: "Project", required: 8 },
  ];
  const mandatory = courses.filter((c) => c.credits === 0);
  return (
    <>
      <PageHeading
        title="The bigger picture, taking shape"
        description="See how your courses add up to your degree."
      />
      <Note>
        Illustrative 160-credit curriculum. Categories and requirements are
        sample data, not an official degree audit.
      </Note>
      <section className="degree-summary panel">
        <GraduationCap size={42} />
        <div>
          <h2>B.Tech · Computer Science</h2>
          <p>Sample curriculum · 8 semesters</p>
        </div>
        <div className="degree-total">
          <strong>
            {totals.earned}
            <span> / 160</span>
          </strong>
          <p>credits completed</p>
        </div>
        <div className="degree-progress">
          <div className="linear-progress">
            <span
              style={{
                width: `${Math.min(100, (totals.earned / 160) * 100)}%`,
              }}
            />
          </div>
          <span>
            {((totals.earned / 160) * 100).toFixed(1)}% of your credit journey
          </span>
        </div>
      </section>
      <div className="workspace-grid">
        <section className="panel requirement-panel">
          <SectionHeading
            title="Every requirement has its place"
            subtitle="Earned credits, grouped by curriculum category."
          />
          {requirements.map((r) => {
            const earned = summarize(
              courses.filter((c) => c.category === r.category),
              profile,
            ).earned;
            return (
              <div className="requirement-row" key={r.name}>
                <div>
                  <h3>{r.name}</h3>
                  <span>
                    {earned} of {r.required} credits
                  </span>
                </div>
                <div className="linear-progress">
                  <span
                    style={{
                      width: `${Math.min(100, (earned / r.required) * 100)}%`,
                    }}
                  />
                </div>
                <span className="requirement-remaining">
                  {Math.max(0, r.required - earned)} remaining
                </span>
              </div>
            );
          })}
          <TextLink onClick={() => navigate("records")}>
            Explore your course record
          </TextLink>
        </section>
        <section className="panel mandatory-panel">
          <SectionHeading
            title="Beyond the credits"
            subtitle="Zero-credit courses still matter for completion."
          />
          {mandatory.map((c) => (
            <div className="mandatory-row" key={c.id}>
              <span className="complete-icon">
                {profile.grades.find((g) => g.label === c.grade)?.outcome ===
                "pass" ? (
                  <Check size={16} />
                ) : (
                  <CircleAlert size={16} />
                )}
              </span>
              <span>
                <strong>{c.name}</strong>
                <small>Semester {c.semester} · Mandatory</small>
              </span>
              <GradeBadge label={c.grade} profile={profile} />
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

export function Attendance({
  courses,
  profile,
  setCourses,
  notify,
}: Shared & { setCourses: SetCourses }) {
  const [threshold, setThreshold] = useState(75);
  const latest = Math.max(...courses.map((c) => c.semester), 1);
  const active = courses.filter((c) => c.semester === latest && c.credits > 0);
  function record(id: string, present: boolean) {
    setCourses((previous) =>
      previous.map((c) =>
        c.id === id
          ? { ...c, held: c.held + 1, attended: c.attended + (present ? 1 : 0) }
          : c,
      ),
    );
    notify(present ? "Class marked present." : "Class marked absent.");
  }
  return (
    <>
      <PageHeading
        title="Keep showing up for your goals"
        description={`A simple attendance picture for semester ${latest}.`}
      >
        <label className="threshold-control">
          Attendance goal
          <Select
            label="Attendance threshold"
            value={String(threshold)}
            onChange={(v) => setThreshold(Number(v))}
          >
            {[65, 70, 75, 80, 85, 90].map((n) => (
              <option value={n} key={n}>
                {n}%
              </option>
            ))}
          </Select>
        </label>
      </PageHeading>
      <Note>
        Sample attendance counts. This planner assumes every scheduled class
        counts equally toward the chosen threshold.
      </Note>
      <section className="panel attendance-panel">
        <SectionHeading
          title="Your classroom picture"
          subtitle={`Your current ${profile.name} workspace · Attendance is tracked separately from GPA.`}
        />
        {active.map((c) => {
          const percent = c.held ? (c.attended / c.held) * 100 : 0;
          const needed = Math.max(
            0,
            Math.ceil(
              ((threshold / 100) * c.held - c.attended) / (1 - threshold / 100),
            ),
          );
          const canMiss = Math.max(
            0,
            Math.floor(c.attended / (threshold / 100) - c.held),
          );
          return (
            <div className="attendance-row" key={c.id}>
              <div className="attendance-course">
                <h3>{c.name}</h3>
                <p>
                  {c.attended} attended / {c.held} classes
                </p>
              </div>
              <div className="attendance-progress">
                <div>
                  <strong className={percent < threshold ? "danger-text" : ""}>
                    {percent.toFixed(1)}%
                  </strong>
                  <span>
                    {percent < threshold
                      ? `Attend next ${needed} classes`
                      : `Can miss ${canMiss} classes`}
                  </span>
                </div>
                <div className="linear-progress">
                  <span
                    className={percent < threshold ? "warning-progress" : ""}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              <div className="button-group">
                <button
                  className="button secondary"
                  onClick={() => record(c.id, false)}
                >
                  Absent
                </button>
                <button
                  className="button primary"
                  onClick={() => record(c.id, true)}
                >
                  <Check size={15} />
                  Present
                </button>
              </div>
            </div>
          );
        })}
      </section>
    </>
  );
}

interface Task {
  id: string;
  title: string;
  date: string;
  type: string;
  done: boolean;
}
export function Planner({ notify }: { notify: (message: string) => void }) {
  const [tasks, setTasks] = useStoredState<Task[]>("gradelytics-planner-v1", [
    {
      id: "1",
      title: "Plan next semester’s course registration",
      date: "2026-11-02",
      type: "Planning",
      done: false,
    },
    {
      id: "2",
      title: "Submit final-year project proposal",
      date: "2026-11-09",
      type: "Coursework",
      done: false,
    },
    {
      id: "3",
      title: "Review grade improvement options",
      date: "2026-11-12",
      type: "Personal goal",
      done: false,
    },
    {
      id: "4",
      title: "Update academic record",
      date: "2026-10-25",
      type: "Planning",
      done: true,
    },
  ]);
  const [adding, setAdding] = useState(false),
    [title, setTitle] = useState(""),
    [date, setDate] = useState("2026-11-16"),
    [type, setType] = useState("Coursework");
  const [filter, setFilter] = useState("all");
  function add(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!title.trim()) return;
    setTasks((previous) => [
      ...previous,
      { id: crypto.randomUUID(), title: title.trim(), date, type, done: false },
    ]);
    setAdding(false);
    setTitle("");
    notify("Added to your semester plan.");
  }
  const visible = tasks
    .filter((t) => filter === "all" || (filter === "done" ? t.done : !t.done))
    .sort((a, b) => a.date.localeCompare(b.date));
  return (
    <>
      <PageHeading
        title="A little planning goes a long way"
        description="A home for deadlines, small steps, and things worth remembering."
      >
        <button className="button primary" onClick={() => setAdding(!adding)}>
          <Plus size={16} />
          {adding ? "Close form" : "Add to your plan"}
        </button>
      </PageHeading>
      {adding && (
        <form className="panel inline-form" onSubmit={add}>
          <div className="form-grid three-columns">
            <label>
              What’s coming up?
              <input
                required
                maxLength={120}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Submit project proposal"
              />
            </label>
            <label>
              Date
              <input
                required
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Category
              <Select label="Plan category" value={type} onChange={setType}>
                {["Coursework", "Planning", "Personal goal"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </Select>
            </label>
          </div>
          <button className="button primary" type="submit">
            Add to planner
            <Check size={16} />
          </button>
        </form>
      )}
      <div className="planner-summary">
        <span>
          <strong>{tasks.filter((t) => !t.done).length}</strong>things ahead
        </span>
        <span>
          <strong>{tasks.filter((t) => t.done).length}</strong>steps completed
        </span>
        <span>
          <CalendarDays size={29} />
          <p>
            One thing at a time.
            <br />
            You’ve got room to grow.
          </p>
        </span>
      </div>
      <section className="panel">
        <div className="record-controls">
          <div className="semester-tabs">
            {[
              { id: "all", label: "Everything" },
              { id: "open", label: "Coming up" },
              { id: "done", label: "Completed" },
            ].map((f) => (
              <button
                key={f.id}
                aria-pressed={filter === f.id}
                className={filter === f.id ? "selected" : ""}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <div className="tasks-list">
          {visible.length === 0 ? (
            <div className="empty-state">
              <CheckCheck size={30} />
              <h3>A little breathing room.</h3>
              <p>
                No items in this view. Add a plan or explore another filter.
              </p>
            </div>
          ) : (
            visible.map((t) => {
              const d = new Date(`${t.date}T12:00:00`);
              return (
                <div
                  className={`task-row ${t.done ? "task-done" : ""}`}
                  key={t.id}
                >
                  <input
                    type="checkbox"
                    aria-label={`Mark ${t.title} ${t.done ? "incomplete" : "complete"}`}
                    checked={t.done}
                    onChange={() =>
                      setTasks((previous) =>
                        previous.map((item) =>
                          item.id === t.id
                            ? { ...item, done: !item.done }
                            : item,
                        ),
                      )
                    }
                  />
                  <span className="date-block">
                    <small>
                      {d
                        .toLocaleString("en-IN", { month: "short" })
                        .toUpperCase()}
                    </small>
                    <strong>{d.getDate().toString().padStart(2, "0")}</strong>
                  </span>
                  <div>
                    <h3>{t.title}</h3>
                    <span className="mini-tag">{t.type}</span>
                  </div>
                  <span className="task-state">
                    {t.done ? "Completed" : "Coming up"}
                  </span>
                  <button
                    className="icon-button"
                    aria-label={`Delete ${t.title}`}
                    onClick={() =>
                      setTasks((previous) =>
                        previous.filter((item) => item.id !== t.id),
                      )
                    }
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>
      <Note>
        Planner items are local sample data. Notifications, calendar sync, and
        university timetable imports are planned for a later stage.
      </Note>
    </>
  );
}

export function Settings({
  profile,
  gradingProfiles,
  setGradingProfiles,
  profileId,
  setProfileId,
  notify,
  dark,
  setDark,
}: {
  profile: GradingProfile;
  gradingProfiles: GradingProfile[];
  setGradingProfiles: Dispatch<SetStateAction<GradingProfile[]>>;
  profileId: string;
  setProfileId: Dispatch<SetStateAction<string>>;
  notify: (message: string) => void;
  dark: boolean;
  setDark: Dispatch<SetStateAction<boolean>>;
}) {
  const [newLabel, setNewLabel] = useState(""),
    [newPoints, setNewPoints] = useState(""),
    [error, setError] = useState("");
  function updatePoints(label: string, points: number) {
    if (!Number.isFinite(points) || points < 0 || points > profile.max) return;
    setGradingProfiles((previous) =>
      previous.map((p) =>
        p.id === profile.id
          ? {
              ...p,
              grades: p.grades.map((g) =>
                g.label === label ? { ...g, points } : g,
              ),
            }
          : p,
      ),
    );
  }
  function addGrade(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const label = newLabel.trim();
    if (
      !label ||
      profile.grades.some((g) => g.label.toLowerCase() === label.toLowerCase())
    ) {
      setError("Choose a unique grade label.");
      return;
    }
    if (
      !newPoints.trim() ||
      Number(newPoints) < 0 ||
      Number(newPoints) > profile.max
    ) {
      setError(`Enter points between 0 and ${profile.max}.`);
      return;
    }
    setGradingProfiles((previous) =>
      previous.map((p) =>
        p.id === profile.id
          ? {
              ...p,
              grades: [
                ...p.grades,
                { label, points: Number(newPoints), outcome: "graded" },
              ],
            }
          : p,
      ),
    );
    setNewLabel("");
    setNewPoints("");
    notify("Custom grade added to this profile.");
  }
  return (
    <>
      <PageHeading
        title="Your college. Your grading rules"
        description="A flexible foundation for the way your university grades."
      />
      <div className="settings-top">
        <section className="panel settings-profile">
          <SlidersHorizontal size={24} />
          <SectionHeading
            title="Choose your grading scale"
            subtitle="Each scale has separate sample records. Your edits are preserved when switching."
          />
          <Select
            label="Active grading profile"
            value={profileId}
            onChange={setProfileId}
          >
            {gradingProfiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
          <Note>
            Presets are examples, not universal university standards. Adjust the
            point mappings below.
          </Note>
        </section>
        <section className="panel appearance-panel">
          <SectionHeading
            title="A workspace that feels like you"
            subtitle="Your colors, in a different light."
          />
          <div className="theme-options">
            <button
              className={!dark ? "theme-option selected" : "theme-option"}
              onClick={() => setDark(false)}
              aria-pressed={!dark}
            >
              <span className="theme-swatch light-swatch">
                <i />
                <i />
                <i />
              </span>
              Light mode{!dark && <Check size={16} />}
            </button>
            <button
              className={dark ? "theme-option selected" : "theme-option"}
              onClick={() => setDark(true)}
              aria-pressed={dark}
            >
              <span className="theme-swatch dark-swatch">
                <i />
                <i />
                <i />
              </span>
              Dark mode{dark && <Check size={16} />}
            </button>
          </div>
          <p className="muted">Pale gray #DDE3E8 · Deep plum #3A0F34</p>
        </section>
      </div>
      <section className="panel grade-settings">
        <SectionHeading
          title="Make the grade points your own"
          subtitle="Decimal values and plus/minus labels are supported. Changes recalculate this profile’s records."
        />
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Grade label</th>
                <th>Grade points</th>
                <th>How it’s counted</th>
              </tr>
            </thead>
            <tbody>
              {profile.grades.map((g) => (
                <tr key={g.label}>
                  <td>
                    <GradeBadge label={g.label} profile={profile} />
                  </td>
                  <td>
                    {g.outcome === "graded" ? (
                      <input
                        className="points-input"
                        aria-label={`Points for grade ${g.label}`}
                        type="number"
                        min="0"
                        max={profile.max}
                        step="0.01"
                        value={g.points}
                        onChange={(e) =>
                          updatePoints(g.label, Number(e.target.value))
                        }
                      />
                    ) : (
                      <span className="muted">
                        {g.outcome === "pass" ? "Not applicable" : "0.00"}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className="muted">
                      {g.outcome === "pass"
                        ? "Pass-only · excluded from GPA"
                        : g.outcome === "fail"
                          ? "Failed · credits included, zero points"
                          : "Credit-weighted GPA contribution"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <form className="add-grade-form" onSubmit={addGrade}>
          <label>
            Custom grade label
            <input
              maxLength={8}
              placeholder="e.g. A+"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              required
            />
          </label>
          <label>
            Points
            <input
              type="number"
              min="0"
              max={profile.max}
              step="0.01"
              placeholder={`0–${profile.max}`}
              value={newPoints}
              onChange={(e) => setNewPoints(e.target.value)}
              required
            />
          </label>
          <button className="button primary" type="submit">
            <Plus size={16} />
            Add grade
          </button>
        </form>
        {error && (
          <p className="error-message" role="alert">
            {error}
          </p>
        )}
      </section>
      <Note>
        The preview includes failed credits in GPA and excludes pass-only
        outcomes. Institution-specific repeat policies and configurable credit
        treatment will be added with the backend.
      </Note>
    </>
  );
}
