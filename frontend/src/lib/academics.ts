export interface Grade {
  label: string;
  points: number;
  outcome: "graded" | "fail" | "pass";
}
export interface GradingProfile {
  id: string;
  name: string;
  max: number;
  grades: Grade[];
}
export interface Course {
  id: string;
  code: string;
  name: string;
  semester: number;
  credits: number;
  grade: string;
  category: string;
  attended: number;
  held: number;
}
const grade = (
  label: string,
  points: number,
  outcome: Grade["outcome"] = "graded",
): Grade => ({ label, points, outcome });
export const profiles: GradingProfile[] = [
  {
    id: "10",
    name: "10-point system",
    max: 10,
    grades: [
      grade("S", 10),
      grade("A", 9),
      grade("B", 8),
      grade("C", 7),
      grade("D", 6),
      grade("E", 5),
      grade("F", 0, "fail"),
      grade("P", 0, "pass"),
    ],
  },
  {
    id: "4",
    name: "4-point system",
    max: 4,
    grades: [
      grade("A", 4),
      grade("A−", 3.7),
      grade("B+", 3.3),
      grade("B", 3),
      grade("B−", 2.7),
      grade("C+", 2.3),
      grade("C", 2),
      grade("D", 1),
      grade("F", 0, "fail"),
      grade("P", 0, "pass"),
    ],
  },
  {
    id: "5",
    name: "5-point system",
    max: 5,
    grades: [
      grade("A+", 5),
      grade("A", 4.5),
      grade("B+", 4),
      grade("B", 3.5),
      grade("C", 3),
      grade("D", 2),
      grade("F", 0, "fail"),
      grade("P", 0, "pass"),
    ],
  },
  {
    id: "9",
    name: "9-point system",
    max: 9,
    grades: [
      grade("A+", 9),
      grade("A", 8),
      grade("B+", 7),
      grade("B", 6),
      grade("C", 5),
      grade("D", 4),
      grade("F", 0, "fail"),
      grade("P", 0, "pass"),
    ],
  },
];
const subjects = [
  [
    "Engineering Mathematics I",
    "Applied Physics",
    "Programming Fundamentals",
    "Engineering Graphics",
    "Communication Skills",
    "Programming Lab",
  ],
  [
    "Engineering Mathematics II",
    "Data Structures",
    "Digital Logic",
    "Environmental Science",
    "Discrete Mathematics",
    "Electronics Lab",
  ],
  [
    "Object-Oriented Programming",
    "Computer Organization",
    "Probability & Statistics",
    "Design Thinking",
    "Database Foundations",
    "Database Lab",
  ],
  [
    "Design & Analysis of Algorithms",
    "Operating Systems",
    "Computer Networks",
    "Software Engineering",
    "Linear Algebra",
    "Networks Lab",
  ],
  [
    "Theory of Computation",
    "Artificial Intelligence",
    "Web Technologies",
    "Compiler Design",
    "Cloud Computing",
    "Web Development Lab",
  ],
  [
    "Machine Learning",
    "Distributed Systems",
    "Information Security",
    "Human–Computer Interaction",
    "Open Elective",
    "Machine Learning Lab",
  ],
];
export function createDemo(profile: GradingProfile): Course[] {
  const ratios = [
    [0.8, 0.9, 0.8, 0.7, 0.9, 1],
    [0.9, 0.8, 0.9, 0.8, 0.9, 0.9],
    [0.8, 0.9, 0.8, 0.9, 0.9, 1],
    [0.9, 0.9, 0.8, 1, 0.8, 1],
    [0.9, 0.8, 0.9, 0.8, 0.9, 1],
    [0.9, 0, 1, 0.8, 0.9, 1],
  ];
  return subjects.flatMap((names, sem) => [
    ...names.map((name, i) => {
      const points = ratios[sem][i] * profile.max;
      const match =
        points === 0
          ? profile.grades.find((g) => g.outcome === "fail")!
          : profile.grades
              .filter((g) => g.outcome === "graded")
              .reduce((a, b) =>
                Math.abs(b.points - points) < Math.abs(a.points - points)
                  ? b
                  : a,
              );
      return {
        id: `${sem + 1}-${i}`,
        code: `${i === 4 ? "OE" : "CS"}${sem + 1}${String(i + 1).padStart(2, "0")}`,
        name,
        semester: sem + 1,
        credits: [4, 4, 3, 3, 3, 2][i],
        grade: match.label,
        category: i === 4 ? "Elective" : i === 5 ? "Lab" : "Core",
        attended: [26, 21, 28, 25, 24, 18][i],
        held: [30, 30, 30, 28, 28, 20][i],
      };
    }),
    {
      id: `${sem + 1}-p`,
      code: `NC${sem + 1}01`,
      name:
        sem === 5
          ? "Ethics & Values"
          : [
              "Student Induction",
              "Community Engagement",
              "Professional Ethics",
              "Constitution of India",
              "Career Readiness",
            ][sem],
      semester: sem + 1,
      credits: 0,
      grade: "P",
      category: "Mandatory",
      attended: 12,
      held: 12,
    },
  ]);
}
export function summarize(
  courses: Course[],
  profile: GradingProfile,
  overrides: Record<string, string> = {},
) {
  let points = 0,
    credits = 0,
    earned = 0,
    backlogs = 0;
  for (const c of courses) {
    const g = profile.grades.find(
      (g) => g.label === (overrides[c.id] ?? c.grade),
    );
    if (!g) continue;
    if (g.outcome !== "pass") {
      points += c.credits * g.points;
      credits += c.credits;
    }
    if (g.outcome !== "fail") earned += c.credits;
    else backlogs++;
  }
  return {
    gpa: credits ? points / credits : null,
    points,
    credits,
    earned,
    backlogs,
  };
}
export function requiredAverage(
  points: number,
  credits: number,
  remaining: number,
  target: number,
) {
  return remaining > 0
    ? (target * (credits + remaining) - points) / remaining
    : null;
}
export function csvExport(courses: Course[]) {
  const escape = (value: unknown) => {
    const text = String(value);
    // CSV quotes escape delimiters, but spreadsheets can still evaluate formulas.
    const safe =
      typeof value === "string" && /^[\s\uFEFF]*[=+\-@]|^[\t\r\n]/u.test(text)
        ? `'${text}`
        : text;
    return `"${safe.replaceAll('"', '""')}"`;
  };
  return [
    "code,name,semester,credits,grade,category",
    ...courses.map((c) =>
      [c.code, c.name, c.semester, c.credits, c.grade, c.category]
        .map(escape)
        .join(","),
    ),
  ].join("\r\n");
}
