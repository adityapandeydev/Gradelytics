import { useCallback, useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { usePressFeedback } from "./lib/usePressFeedback";
import { useStoredState } from "./lib/useStoredState";
import {
  ArrowDownToLine,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  ChartNoAxesCombined,
  Check,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  FlaskConical,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Moon,
  Plus,
  Settings2,
  ShieldCheck,
  Sun,
  Target,
  TrendingUp,
  X,
} from "lucide-react";
import { createDemo, csvExport, profiles, summarize } from "./lib/academics";
import type { Course, GradingProfile } from "./lib/academics";
import { CourseTable, SectionHeading, Select, TextLink } from "./components/ui";
import { downloadFile } from "./lib/files";
import {
  Attendance,
  Curriculum,
  Goals,
  Planner,
  Records,
  Settings,
  Simulator,
} from "./components/workspaces";
import "./App.css";

type Page =
  | "overview"
  | "records"
  | "simulator"
  | "goals"
  | "curriculum"
  | "attendance"
  | "planner"
  | "settings";
const navigation = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "records", label: "Academic record", icon: BookOpen },
  { id: "simulator", label: "Grade simulator", icon: FlaskConical },
  { id: "goals", label: "Target planner", icon: Target },
  { id: "curriculum", label: "My curriculum", icon: GraduationCap },
  { id: "attendance", label: "Attendance", icon: ClipboardList },
  { id: "planner", label: "Semester planner", icon: CalendarDays },
] as const;
function currentPage(): Page {
  const hash = location.hash.slice(1);
  return [...navigation.map((n) => n.id), "settings"].includes(hash)
    ? (hash as Page)
    : "overview";
}
export default function App() {
  usePressFeedback();
  const [page, setPage] = useState<Page>(currentPage);
  const activePage = useRef(page);
  const pageBodyRef = useRef<HTMLDivElement>(null);
  const pageStageRef = useRef<HTMLDivElement>(null);
  const pageTransition = useRef<{
    enter: Animation;
    exit: Animation;
    snapshot: HTMLElement;
  } | null>(null);
  const [dark, setDark] = useStoredState("gradelytics-theme-v1", false);
  const [profileId, setProfileId] = useStoredState(
    "gradelytics-profile-v1",
    "10",
  );
  const [gradingProfiles, setGradingProfiles] = useStoredState<
    GradingProfile[]
  >("gradelytics-grades-v1", profiles);
  const [records, setRecords] = useStoredState<Record<string, Course[]>>(
    "gradelytics-records-v1",
    () => Object.fromEntries(profiles.map((p) => [p.id, createDemo(p)])),
  );
  const [mobileNav, setMobileNav] = useState(false);
  const [compactNav, setCompactNav] = useState(
    () => window.matchMedia("(max-width: 760px)").matches,
  );
  const sidebarRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [toast, setToast] = useState("");
  const [search, setSearch] = useState("");
  const profile =
    gradingProfiles.find((p) => p.id === profileId) ?? gradingProfiles[0];
  const courses = records[profile.id] ?? createDemo(profile);
  const totals = summarize(courses, profile);
  const latestSemester = Math.max(1, ...courses.map((c) => c.semester));
  const setCourses = (update: Course[] | ((previous: Course[]) => Course[])) =>
    setRecords((previous) => ({
      ...previous,
      [profile.id]:
        typeof update === "function"
          ? update(previous[profile.id] ?? createDemo(profile))
          : update,
    }));
  const notify = (message: string) => setToast(message);
  const transitionTo = useCallback((next: Page) => {
    setMobileNav(false);
    if (activePage.current === next) return;
    activePage.current = next;
    const previous = pageTransition.current;
    previous?.enter.cancel();
    previous?.exit.cancel();
    previous?.snapshot.remove();
    pageTransition.current = null;
    const update = () => {
      flushSync(() => setPage(next));
      window.scrollTo({ top: 0, behavior: "instant" });
    };
    if (
      !pageBodyRef.current ||
      !pageStageRef.current ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      update();
      return;
    }
    // Only the outgoing content is copied. Navigation remains live during the fade.
    const snapshot = pageBodyRef.current.cloneNode(true) as HTMLElement;
    snapshot.classList.add("page-exit-snapshot");
    snapshot.setAttribute("aria-hidden", "true");
    snapshot.inert = true;
    snapshot.querySelectorAll(".press-ink").forEach((layer) => layer.remove());
    snapshot
      .querySelectorAll("[id]")
      .forEach((node) => node.removeAttribute("id"));
    pageStageRef.current.append(snapshot);
    update();
    const enter = pageBodyRef.current.animate(
      [
        { opacity: 0, transform: "translateY(6px)" },
        { opacity: 1, transform: "translateY(0)" },
      ],
      { duration: 170, easing: "cubic-bezier(.16,1,.3,1)" },
    );
    const exit = snapshot.animate(
      [
        { opacity: 1, transform: "translateY(0)" },
        { opacity: 0, transform: "translateY(-3px)" },
      ],
      { duration: 90, easing: "ease-out", fill: "forwards" },
    );
    const transition = { enter, exit, snapshot };
    pageTransition.current = transition;
    void Promise.all([enter.finished, exit.finished]).then(
      () => {
        snapshot.remove();
        if (pageTransition.current === transition)
          pageTransition.current = null;
      },
      () => snapshot.remove(),
    );
  }, []);
  const navigate = (next: Page) => {
    location.hash = next;
    transitionTo(next);
  };
  const changeGrade = (id: string, value: string) => {
    setCourses((previous) =>
      previous.map((c) => (c.id === id ? { ...c, grade: value } : c)),
    );
    notify("Grade updated in your browser.");
  };
  useEffect(() => {
    const handler = () => transitionTo(currentPage());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, [transitionTo]);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stop = () => {
      pageTransition.current?.enter.cancel();
      pageTransition.current?.exit.cancel();
      pageTransition.current?.snapshot.remove();
      pageTransition.current = null;
    };
    const changed = () => {
      if (preference.matches) stop();
    };
    preference.addEventListener("change", changed);
    return () => {
      preference.removeEventListener("change", changed);
      stop();
    };
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    document.documentElement.style.colorScheme = dark ? "dark" : "light";
  }, [dark]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(""), 4200);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    document.title = `${page === "settings" ? "Grading settings" : navigation.find((n) => n.id === page)?.label} · Gradelytics`;
  }, [page]);
  useEffect(() => {
    const media = window.matchMedia("(max-width: 760px)");
    const update = () => {
      setCompactNav(media.matches);
      if (!media.matches) setMobileNav(false);
    };
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (!mobileNav) return;
    closeRef.current?.focus();
    const menuButton = menuRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileNav(false);
      if (event.key === "Tab") {
        const controls = Array.from(
          sidebarRef.current?.querySelectorAll<HTMLElement>("a[href],button") ??
            [],
        ).filter((el) => el.getClientRects().length > 0);
        const first = controls[0],
          last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener("keydown", close);
    return () => {
      window.removeEventListener("keydown", close);
      document.body.style.overflow = previousOverflow;
      menuButton?.focus();
    };
  }, [mobileNav]);
  const shared = { courses, profile, navigate, notify };
  return (
    <div className="app-shell">
      <a
        href="#main"
        className="skip-link"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById("main")?.focus();
        }}
      >
        Skip to content
      </a>
      {mobileNav && (
        <button
          className="nav-scrim"
          aria-label="Close navigation"
          onClick={() => setMobileNav(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        inert={compactNav && !mobileNav}
        className={`sidebar ${mobileNav ? "nav-open" : ""}`}
        aria-label="Main navigation"
      >
        <button
          ref={closeRef}
          className="icon-button drawer-close"
          aria-label="Close menu"
          onClick={() => setMobileNav(false)}
        >
          <X size={18} />
        </button>
        <a
          className="brand"
          href="#overview"
          onClick={() => navigate("overview")}
          aria-label="Gradelytics overview"
        >
          <span className="brand-mark">
            <ChartNoAxesCombined
              size={23}
              strokeWidth={2.5}
              aria-hidden="true"
            />
          </span>
          <span>
            gradelytics<span className="brand-period">.</span>
          </span>
        </a>
        <button
          className="workspace-switch"
          onClick={() => navigate("settings")}
        >
          <span className="workspace-icon">
            <GraduationCap size={19} aria-hidden="true" />
          </span>
          <span>
            <strong>My workspace</strong>
            <small>Student edition</small>
          </span>
          <ChevronRight size={14} aria-hidden="true" />
        </button>
        <span className="nav-label">YOUR ACADEMICS</span>
        <nav>
          {navigation.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => navigate(item.id)}
              className={`nav-item ${page === item.id ? "active" : ""}`}
              aria-current={page === item.id ? "page" : undefined}
            >
              <item.icon size={19} aria-hidden="true" />
              <span>{item.label}</span>
              {item.id === "simulator" && <span className="new-tag">TRY</span>}
            </a>
          ))}
        </nav>
        <div className="sidebar-note">
          <span className="note-art" aria-hidden="true">
            <span />
            <span />
            <span />
            <TrendingUp size={30} />
          </span>
          <h3>
            Small steps.
            <br />
            Bigger possibilities.
          </h3>
          <p>Your next chapter starts with a little planning.</p>
          <button onClick={() => navigate("goals")}>
            Set an academic goal <ArrowUpRight size={15} aria-hidden="true" />
          </button>
        </div>
        <div className="sidebar-bottom">
          <a
            className={`nav-item ${page === "settings" ? "active" : ""}`}
            href="#settings"
            onClick={() => navigate("settings")}
          >
            <Settings2 size={19} aria-hidden="true" />
            <span>Grading settings</span>
          </a>
          <button
            className="nav-item"
            onClick={() =>
              notify(
                "Interactive preview: changes stay in this browser. Open Academic record to edit your courses.",
              )
            }
          >
            <CircleHelp size={19} aria-hidden="true" />
            <span>Help & getting started</span>
          </button>
          <div className="profile">
            <span className="avatar">AP</span>
            <span>
              <strong>Aditya Pandey</strong>
              <small>Sample student profile</small>
            </span>
            <span className="online-dot" aria-label="Local preview" />
          </div>
        </div>
      </aside>
      <div className="main-shell" inert={compactNav && mobileNav}>
        <header className="topbar">
          <div className="breadcrumb">
            <button
              className="icon-button mobile-menu"
              ref={menuRef}
              aria-label="Open navigation"
              aria-expanded={mobileNav}
              onClick={() => setMobileNav(!mobileNav)}
            >
              {mobileNav ? <X size={21} /> : <Menu size={21} />}
            </button>
            <span>Workspace</span>
            <ChevronRight size={13} aria-hidden="true" />
            <strong>
              {page === "settings"
                ? "Grading settings"
                : navigation.find((n) => n.id === page)?.label}
            </strong>
          </div>
          <div className="topbar-actions">
            <span className="preview-badge">
              <span />
              Demo workspace
            </span>
            <button
              className="icon-button theme-toggle"
              aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
              aria-pressed={dark}
              onClick={() => setDark(!dark)}
            >
              <span
                className={`theme-glyph ${dark ? "is-dark" : ""}`}
                aria-hidden="true"
              >
                <Sun size={19} className="theme-sun" />
                <Moon size={19} className="theme-moon" />
              </span>
            </button>
            <span className="topbar-divider" />
            <span className="avatar small">AP</span>
          </div>
        </header>
        <main id="main" className="main-content" tabIndex={-1}>
          <div className="page-stage" ref={pageStageRef}>
            <div className="page-body" data-page={page} ref={pageBodyRef}>
              {page === "overview" ? (
                <>
                  <div className="page-heading">
                    <div>
                      <h1>
                        Your progress, in perspective<span>.</span>
                      </h1>
                      <p>
                        A little clarity for wherever your academic journey
                        takes you.
                      </p>
                    </div>
                    <button
                      className="button primary"
                      onClick={() => navigate("records")}
                    >
                      <Plus size={17} aria-hidden="true" />
                      Add your grades
                    </button>
                  </div>
                  <div className="overview-toolbar">
                    <div className="student-greeting">
                      <span className="greeting-line" />
                      Here’s where you stand, Aditya.
                    </div>
                    <Select
                      label="Grading system"
                      value={profile.id}
                      onChange={setProfileId}
                    >
                      {gradingProfiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <section className="stats-row" aria-label="Academic summary">
                    <div className="stat primary-stat">
                      <span>
                        Cumulative GPA <span className="tiny-info">CGPA</span>
                      </span>
                      <div>
                        <strong>{totals.gpa?.toFixed(2) ?? "—"}</strong>
                        <span className="stat-max">
                          / {profile.max.toFixed(1)}
                        </span>
                      </div>
                      <small>
                        <TrendingUp size={13} aria-hidden="true" />
                        Your complete academic picture
                      </small>
                    </div>
                    <div className="stat">
                      <span>Credits earned</span>
                      <div>
                        <strong>{totals.earned}</strong>
                        <span className="stat-max">/ 160</span>
                      </div>
                      <small>
                        {Math.max(0, 160 - totals.earned)} credits to your
                        degree
                      </small>
                    </div>
                    <div className="stat">
                      <span>Semesters completed</span>
                      <div>
                        <strong>
                          {new Set(courses.map((c) => c.semester)).size
                            .toString()
                            .padStart(2, "0")}
                        </strong>
                        <span className="stat-max">/ 08</span>
                      </div>
                      <small>A little further, every semester</small>
                    </div>
                    <div className="stat">
                      <span>Courses to clear</span>
                      <div>
                        <strong>
                          {totals.backlogs.toString().padStart(2, "0")}
                        </strong>
                        <span className="stat-flag">
                          {totals.backlogs ? "Needs attention" : "All clear"}
                        </span>
                      </div>
                      <small>
                        <span className="amber-dot" />A fresh attempt, a new
                        possibility
                      </small>
                    </div>
                  </section>
                  <div className="overview-main-grid">
                    <section className="panel performance-panel">
                      <SectionHeading
                        title="Every semester tells a story"
                        subtitle="Your semester GPA, across the journey."
                        action={
                          <span className="legend">
                            <span />
                            Semester GPA
                          </span>
                        }
                      />
                      <TrendChart courses={courses} profile={profile} />
                      <div className="chart-footer">
                        <span>
                          <TrendingUp size={15} aria-hidden="true" />
                          Progress isn’t always a straight line. Keep going.
                        </span>
                        <TextLink onClick={() => navigate("records")}>
                          View academic record
                        </TextLink>
                      </div>
                    </section>
                    <section className="goal-panel">
                      <div className="goal-panel-top">
                        <Target size={19} aria-hidden="true" />
                        <ArrowUpRight size={19} aria-hidden="true" />
                      </div>
                      <h2>Your next milestone.</h2>
                      <div className="goal-value">
                        {(profile.max * 0.85).toFixed(2)}
                        <span>CGPA</span>
                      </div>
                      <p>
                        See what it takes to get there.
                        <br />
                        Build a plan that works for you.
                      </p>
                      <div className="goal-track">
                        <span
                          style={{
                            width: `${Math.min(100, ((totals.gpa ?? 0) / profile.max) * 100)}%`,
                          }}
                        />
                        <i style={{ left: "85%" }} />
                      </div>
                      <div className="goal-track-labels">
                        <span>Now · {totals.gpa?.toFixed(2)}</span>
                        <span>Goal · {(profile.max * 0.85).toFixed(2)}</span>
                      </div>
                      <button
                        className="button goal-button"
                        onClick={() => navigate("goals")}
                      >
                        Let’s make a plan
                        <ArrowRight size={17} aria-hidden="true" />
                      </button>
                    </section>
                  </div>
                  <section className="possibility-banner">
                    <span className="possibility-icon">
                      <FlaskConical size={24} aria-hidden="true" />
                    </span>
                    <div>
                      <h3>What if your next attempt changed the picture?</h3>
                      <p>
                        Try a grade improvement. See the impact. Find your best
                        next move.
                      </p>
                    </div>
                    <button onClick={() => navigate("simulator")}>
                      Explore the simulator
                      <ArrowUpRight size={17} aria-hidden="true" />
                    </button>
                  </section>
                  <div className="overview-bottom-grid">
                    <section className="panel courses-panel">
                      <SectionHeading
                        title="Your latest semester"
                        subtitle={`Semester ${latestSemester} · Sample course record`}
                        action={
                          <TextLink onClick={() => navigate("records")}>
                            All courses
                          </TextLink>
                        }
                      />
                      <CourseTable
                        courses={courses.filter(
                          (c) => c.semester === latestSemester,
                        )}
                        profile={profile}
                        compact
                      />
                    </section>
                    <section className="panel next-panel">
                      <SectionHeading
                        title="A little ahead"
                        subtitle="Make room for what comes next."
                      />
                      <div className="next-item">
                        <span className="date-block">
                          <small>NOV</small>
                          <strong>02</strong>
                        </span>
                        <div>
                          <h3>Course registration</h3>
                          <p>Plan your next semester’s subjects</p>
                          <span className="mini-tag">Planning</span>
                        </div>
                      </div>
                      <div className="next-item">
                        <span className="date-block">
                          <small>NOV</small>
                          <strong>09</strong>
                        </span>
                        <div>
                          <h3>Project proposal</h3>
                          <p>A first step toward your final project</p>
                          <span className="mini-tag">Coursework</span>
                        </div>
                      </div>
                      <button
                        className="planner-link"
                        onClick={() => navigate("planner")}
                      >
                        Open semester planner
                        <ArrowRight size={16} aria-hidden="true" />
                      </button>
                      <div className="curriculum-mini">
                        <GraduationCap size={23} aria-hidden="true" />
                        <h3>Your degree, taking shape.</h3>
                        <p>
                          {totals.earned} credits earned. Every course counts
                          toward the bigger picture.
                        </p>
                        <div className="linear-progress">
                          <span
                            style={{
                              width: `${Math.min(100, (totals.earned / 160) * 100)}%`,
                            }}
                          />
                        </div>
                        <TextLink onClick={() => navigate("curriculum")}>
                          See curriculum progress
                        </TextLink>
                      </div>
                    </section>
                  </div>
                </>
              ) : (
                <>
                  {page === "records" && (
                    <Records
                      {...shared}
                      setCourses={setCourses}
                      changeGrade={changeGrade}
                      search={search}
                      setSearch={setSearch}
                    />
                  )}
                  {page === "simulator" && <Simulator {...shared} />}
                  {page === "goals" && <Goals {...shared} />}
                  {page === "curriculum" && <Curriculum {...shared} />}
                  {page === "attendance" && (
                    <Attendance {...shared} setCourses={setCourses} />
                  )}
                  {page === "planner" && <Planner notify={notify} />}
                  {page === "settings" && (
                    <Settings
                      profile={profile}
                      gradingProfiles={gradingProfiles}
                      setGradingProfiles={setGradingProfiles}
                      profileId={profileId}
                      setProfileId={setProfileId}
                      notify={notify}
                      dark={dark}
                      setDark={setDark}
                    />
                  )}
                </>
              )}
            </div>
          </div>
          <footer className="page-footer">
            <span>
              <ShieldCheck size={14} aria-hidden="true" />
              Your plans. Your pace.
            </span>
            <span>Illustrative data · Saved in this browser only</span>
            <button
              onClick={() =>
                downloadFile(csvExport(courses), "gradelytics-records.csv")
              }
            >
              <ArrowDownToLine size={13} aria-hidden="true" />
              Export your data
            </button>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="status">
          <Check size={17} aria-hidden="true" />
          <span>{toast}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast("")}
          >
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
function TrendChart({
  courses,
  profile,
}: {
  courses: Course[];
  profile: GradingProfile;
}) {
  const values = Array.from(new Set(courses.map((c) => c.semester)))
    .sort((a, b) => a - b)
    .map((s) => ({
      semester: s,
      gpa:
        summarize(
          courses.filter((c) => c.semester === s),
          profile,
        ).gpa ?? 0,
    }));
  const width = 640,
    height = 186,
    left = 39,
    right = 24,
    top = 25,
    bottom = 32;
  const points = values.map((v, i) => ({
    x: left + (i * (width - left - right)) / Math.max(1, values.length - 1),
    y: top + (1 - v.gpa / profile.max) * (height - top - bottom),
  }));
  const path = points.map((p, i) => `${i ? "L" : "M"} ${p.x} ${p.y}`).join(" ");
  return (
    <div className="trend-chart">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Semester GPA: ${values.map((v) => `semester ${v.semester}, ${v.gpa.toFixed(2)}`).join("; ")}`}
      >
        <title>Semester GPA trend</title>
        {[0.4, 0.6, 0.8, 1].map((f) => {
          const y = top + (1 - f) * (height - top - bottom);
          return (
            <g key={f}>
              <line
                x1={left}
                x2={width - right}
                y1={y}
                y2={y}
                className="chart-grid"
              />
              <text
                x={left - 13}
                y={y + 4}
                textAnchor="end"
                className="chart-axis"
              >
                {(profile.max * f).toFixed(0)}
              </text>
            </g>
          );
        })}
        <path
          d={`${path} L ${points.at(-1)?.x ?? left} ${height - bottom} L ${left} ${height - bottom} Z`}
          className="chart-area"
        />
        <path d={path} className="chart-line" pathLength={1} />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={4.5} className="chart-point" />
            <text
              x={p.x + (i === 0 ? 9 : i === points.length - 1 ? -9 : 0)}
              y={p.y - 13}
              textAnchor={
                i === 0 ? "start" : i === points.length - 1 ? "end" : "middle"
              }
              className="chart-value"
            >
              {values[i].gpa.toFixed(2)}
            </text>
            <text
              x={p.x}
              y={height - 9}
              textAnchor="middle"
              className="chart-axis"
            >
              Sem {values[i].semester}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
